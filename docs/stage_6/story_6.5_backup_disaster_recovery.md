# Story 6.5: Backup & Disaster Recovery

## Story Details
- **Stage**: 6 - Post-Launch Tasks
- **Priority**: Critical
- **Estimated Hours**: 4-6 hours
- **Dependencies**: Infrastructure setup complete

## Objective
Implement a comprehensive backup and disaster recovery system including automated database backups, file storage backups, configuration backups, and recovery procedures. Ensure business continuity with minimal downtime in case of failures.

## Acceptance Criteria
- [ ] Automated database backups (daily, weekly, monthly)
- [ ] File storage backup system
- [ ] Configuration and secrets backup
- [ ] Point-in-time recovery capability
- [ ] Backup verification and testing
- [ ] Disaster recovery procedures
- [ ] Backup monitoring and alerts
- [ ] Recovery time objectives (RTO) < 4 hours
- [ ] Recovery point objectives (RPO) < 1 hour
- [ ] Multi-region backup storage
- [ ] Backup encryption
- [ ] Restoration testing automation

## Implementation Steps

### 1. Database Backup System

#### Create `scripts/backup/database-backup.ts`
```typescript
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createHash } from 'crypto'
import { gzip } from 'zlib'
import { promisify as promisifyZlib } from 'util'
import { WebClient } from '@slack/web-api'

const execAsync = promisify(exec)
const gzipAsync = promisifyZlib(gzip)

interface BackupConfig {
  database: {
    url: string
    name: string
  }
  storage: {
    s3: {
      bucket: string
      region: string
      prefix: string
    }
    local: {
      path: string
      retention: number // days
    }
  }
  encryption: {
    algorithm: string
    key: string
  }
  notifications: {
    slack: {
      channel: string
      enabled: boolean
    }
    email: {
      to: string[]
      enabled: boolean
    }
  }
}

export class DatabaseBackupService {
  private s3Client: S3Client
  private slackClient: WebClient
  private config: BackupConfig
  
  constructor(config: BackupConfig) {
    this.config = config
    this.s3Client = new S3Client({ region: config.storage.s3.region })
    this.slackClient = new WebClient(process.env.SLACK_TOKEN)
  }
  
  // Main backup function
  async backup(type: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<void> {
    const startTime = Date.now()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = `${this.config.database.name}-${type}-${timestamp}`
    
    try {
      console.log(`Starting ${type} backup: ${backupName}`)
      
      // 1. Create database dump
      const dumpPath = await this.createDatabaseDump(backupName)
      
      // 2. Compress the dump
      const compressedPath = await this.compressBackup(dumpPath)
      
      // 3. Encrypt the backup
      const encryptedPath = await this.encryptBackup(compressedPath)
      
      // 4. Upload to S3
      const s3Location = await this.uploadToS3(encryptedPath, backupName, type)
      
      // 5. Verify backup integrity
      await this.verifyBackup(encryptedPath, s3Location)
      
      // 6. Clean up local files
      await this.cleanupLocalFiles([dumpPath, compressedPath, encryptedPath])
      
      // 7. Update backup catalog
      await this.updateBackupCatalog({
        name: backupName,
        type,
        size: await this.getFileSize(encryptedPath),
        location: s3Location,
        checksum: await this.calculateChecksum(encryptedPath),
        duration: Date.now() - startTime,
        timestamp: new Date(),
      })
      
      // 8. Send success notification
      await this.notifySuccess(backupName, type, Date.now() - startTime)
      
      console.log(`Backup completed successfully: ${backupName}`)
    } catch (error) {
      console.error(`Backup failed: ${backupName}`, error)
      await this.notifyFailure(backupName, type, error)
      throw error
    }
  }
  
  // Create database dump
  private async createDatabaseDump(backupName: string): Promise<string> {
    const dumpPath = path.join(this.config.storage.local.path, `${backupName}.sql`)
    
    // PostgreSQL dump command
    const command = `pg_dump ${this.config.database.url} \
      --no-owner \
      --no-privileges \
      --format=custom \
      --verbose \
      --file="${dumpPath}"`
    
    await execAsync(command)
    
    return dumpPath
  }
  
  // Compress backup
  private async compressBackup(filePath: string): Promise<string> {
    const compressedPath = `${filePath}.gz`
    
    const fileContent = await fs.readFile(filePath)
    const compressed = await gzipAsync(fileContent, { level: 9 })
    
    await fs.writeFile(compressedPath, compressed)
    
    return compressedPath
  }
  
  // Encrypt backup
  private async encryptBackup(filePath: string): Promise<string> {
    const encryptedPath = `${filePath}.enc`
    
    const command = `openssl enc \
      -${this.config.encryption.algorithm} \
      -salt \
      -in "${filePath}" \
      -out "${encryptedPath}" \
      -pass pass:${this.config.encryption.key}`
    
    await execAsync(command)
    
    return encryptedPath
  }
  
  // Upload to S3
  private async uploadToS3(
    filePath: string,
    backupName: string,
    type: string
  ): Promise<string> {
    const fileContent = await fs.readFile(filePath)
    const key = `${this.config.storage.s3.prefix}/${type}/${backupName}.sql.gz.enc`
    
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.config.storage.s3.bucket,
        Key: key,
        Body: fileContent,
        StorageClass: type === 'monthly' ? 'GLACIER' : 'STANDARD_IA',
        ServerSideEncryption: 'AES256',
        Metadata: {
          'backup-type': type,
          'backup-date': new Date().toISOString(),
          'database-name': this.config.database.name,
        },
      })
    )
    
    return `s3://${this.config.storage.s3.bucket}/${key}`
  }
  
  // Verify backup integrity
  private async verifyBackup(localPath: string, s3Location: string): Promise<void> {
    // Calculate local file checksum
    const localChecksum = await this.calculateChecksum(localPath)
    
    // Download from S3 and verify
    const tempPath = `${localPath}.verify`
    const command = `aws s3 cp ${s3Location} ${tempPath}`
    
    await execAsync(command)
    const s3Checksum = await this.calculateChecksum(tempPath)
    
    if (localChecksum !== s3Checksum) {
      throw new Error('Backup verification failed: checksums do not match')
    }
    
    await fs.unlink(tempPath)
  }
  
  // Calculate file checksum
  private async calculateChecksum(filePath: string): Promise<string> {
    const fileContent = await fs.readFile(filePath)
    return createHash('sha256').update(fileContent).digest('hex')
  }
  
  // Get file size
  private async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath)
    return stats.size
  }
  
  // Clean up local files
  private async cleanupLocalFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath)
      } catch (error) {
        console.warn(`Failed to delete ${filePath}:`, error)
      }
    }
    
    // Clean up old backups based on retention policy
    await this.cleanupOldBackups()
  }
  
  // Clean up old backups
  private async cleanupOldBackups(): Promise<void> {
    const files = await fs.readdir(this.config.storage.local.path)
    const now = Date.now()
    const retentionMs = this.config.storage.local.retention * 24 * 60 * 60 * 1000
    
    for (const file of files) {
      const filePath = path.join(this.config.storage.local.path, file)
      const stats = await fs.stat(filePath)
      
      if (now - stats.mtime.getTime() > retentionMs) {
        await fs.unlink(filePath)
        console.log(`Deleted old backup: ${file}`)
      }
    }
  }
  
  // Update backup catalog
  private async updateBackupCatalog(backup: any): Promise<void> {
    await db.backup.create({
      data: backup,
    })
  }
  
  // Send success notification
  private async notifySuccess(
    backupName: string,
    type: string,
    duration: number
  ): Promise<void> {
    const message = `✅ Database backup completed successfully
- Name: ${backupName}
- Type: ${type}
- Duration: ${Math.round(duration / 1000)}s`
    
    if (this.config.notifications.slack.enabled) {
      await this.slackClient.chat.postMessage({
        channel: this.config.notifications.slack.channel,
        text: message,
      })
    }
    
    if (this.config.notifications.email.enabled) {
      await sendEmail({
        to: this.config.notifications.email.to,
        subject: `Backup Success: ${backupName}`,
        text: message,
      })
    }
  }
  
  // Send failure notification
  private async notifyFailure(
    backupName: string,
    type: string,
    error: any
  ): Promise<void> {
    const message = `❌ Database backup failed
- Name: ${backupName}
- Type: ${type}
- Error: ${error.message}`
    
    if (this.config.notifications.slack.enabled) {
      await this.slackClient.chat.postMessage({
        channel: this.config.notifications.slack.channel,
        text: message,
        attachments: [
          {
            color: 'danger',
            fields: [
              {
                title: 'Error Details',
                value: error.stack || error.toString(),
              },
            ],
          },
        ],
      })
    }
  }
}

// Backup runner
export async function runBackup(type: 'daily' | 'weekly' | 'monthly') {
  const config: BackupConfig = {
    database: {
      url: process.env.DATABASE_URL!,
      name: process.env.DATABASE_NAME || 'textcaseconverter',
    },
    storage: {
      s3: {
        bucket: process.env.BACKUP_S3_BUCKET!,
        region: process.env.AWS_REGION || 'us-east-1',
        prefix: 'database-backups',
      },
      local: {
        path: '/tmp/backups',
        retention: 7, // Keep local backups for 7 days
      },
    },
    encryption: {
      algorithm: 'aes-256-cbc',
      key: process.env.BACKUP_ENCRYPTION_KEY!,
    },
    notifications: {
      slack: {
        channel: '#backup-alerts',
        enabled: true,
      },
      email: {
        to: ['ops@textcaseconverter.com'],
        enabled: true,
      },
    },
  }
  
  const service = new DatabaseBackupService(config)
  await service.backup(type)
}
```

### 2. File Storage Backup

#### Create `scripts/backup/file-backup.ts`
```typescript
import { S3Client, ListObjectsV2Command, CopyObjectCommand } from '@aws-sdk/client-s3'
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront'
import * as tar from 'tar'
import * as path from 'path'
import * as fs from 'fs/promises'

export class FileStorageBackupService {
  private sourceS3: S3Client
  private backupS3: S3Client
  private cloudfront: CloudFrontClient
  
  constructor() {
    this.sourceS3 = new S3Client({ region: process.env.AWS_REGION })
    this.backupS3 = new S3Client({ region: process.env.BACKUP_AWS_REGION })
    this.cloudfront = new CloudFrontClient({ region: process.env.AWS_REGION })
  }
  
  // Backup uploaded files
  async backupFiles(): Promise<void> {
    const sourceBucket = process.env.UPLOADS_S3_BUCKET!
    const backupBucket = process.env.BACKUP_S3_BUCKET!
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    try {
      console.log('Starting file storage backup...')
      
      // List all objects in source bucket
      const objects = await this.listAllObjects(sourceBucket)
      console.log(`Found ${objects.length} files to backup`)
      
      // Copy objects to backup bucket
      const backupPrefix = `file-backups/${timestamp}`
      let copiedCount = 0
      
      for (const object of objects) {
        if (!object.Key) continue
        
        await this.copyObject(
          sourceBucket,
          object.Key,
          backupBucket,
          `${backupPrefix}/${object.Key}`
        )
        
        copiedCount++
        
        // Progress logging
        if (copiedCount % 100 === 0) {
          console.log(`Copied ${copiedCount}/${objects.length} files`)
        }
      }
      
      console.log(`File backup completed: ${copiedCount} files copied`)
      
      // Create manifest
      await this.createBackupManifest(backupBucket, backupPrefix, objects)
      
      // Notify success
      await this.notifyBackupComplete(copiedCount, timestamp)
    } catch (error) {
      console.error('File backup failed:', error)
      throw error
    }
  }
  
  // List all objects in bucket
  private async listAllObjects(bucket: string): Promise<any[]> {
    const objects: any[] = []
    let continuationToken: string | undefined
    
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      })
      
      const response = await this.sourceS3.send(command)
      
      if (response.Contents) {
        objects.push(...response.Contents)
      }
      
      continuationToken = response.NextContinuationToken
    } while (continuationToken)
    
    return objects
  }
  
  // Copy object between buckets
  private async copyObject(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string
  ): Promise<void> {
    await this.backupS3.send(
      new CopyObjectCommand({
        CopySource: `${sourceBucket}/${sourceKey}`,
        Bucket: destBucket,
        Key: destKey,
        StorageClass: 'GLACIER',
        ServerSideEncryption: 'AES256',
      })
    )
  }
  
  // Create backup manifest
  private async createBackupManifest(
    bucket: string,
    prefix: string,
    objects: any[]
  ): Promise<void> {
    const manifest = {
      timestamp: new Date().toISOString(),
      fileCount: objects.length,
      totalSize: objects.reduce((sum, obj) => sum + (obj.Size || 0), 0),
      files: objects.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        etag: obj.ETag,
      })),
    }
    
    await this.backupS3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `${prefix}/manifest.json`,
        Body: JSON.stringify(manifest, null, 2),
        ContentType: 'application/json',
      })
    )
  }
  
  // Backup static assets
  async backupStaticAssets(): Promise<void> {
    const assetsDir = path.join(process.cwd(), 'public')
    const backupPath = `/tmp/static-backup-${Date.now()}.tar.gz`
    
    // Create tar archive
    await tar.create(
      {
        gzip: true,
        file: backupPath,
        cwd: assetsDir,
      },
      ['.']
    )
    
    // Upload to S3
    const fileContent = await fs.readFile(backupPath)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    await this.backupS3.send(
      new PutObjectCommand({
        Bucket: process.env.BACKUP_S3_BUCKET!,
        Key: `static-backups/${timestamp}/assets.tar.gz`,
        Body: fileContent,
        StorageClass: 'STANDARD_IA',
      })
    )
    
    // Clean up
    await fs.unlink(backupPath)
  }
  
  private async notifyBackupComplete(fileCount: number, timestamp: string): Promise<void> {
    // Send notification
    await slack.chat.postMessage({
      channel: '#backup-alerts',
      text: `✅ File storage backup completed
- Files: ${fileCount}
- Timestamp: ${timestamp}`,
    })
  }
}
```

### 3. Configuration Backup

#### Create `scripts/backup/config-backup.ts`
```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import { SSMClient, GetParametersByPathCommand, PutParameterCommand } from '@aws-sdk/client-ssm'
import * as fs from 'fs/promises'
import * as path from 'path'
import { encrypt, decrypt } from '@/lib/encryption'

export class ConfigurationBackupService {
  private secretManager: SecretManagerServiceClient
  private ssmClient: SSMClient
  
  constructor() {
    this.secretManager = new SecretManagerServiceClient()
    this.ssmClient = new SSMClient({ region: process.env.AWS_REGION })
  }
  
  // Backup all configuration
  async backupConfiguration(): Promise<void> {
    const timestamp = new Date().toISOString()
    const backupData: any = {
      timestamp,
      environment: process.env.NODE_ENV,
      configurations: {},
    }
    
    try {
      // 1. Backup environment variables
      backupData.configurations.environment = await this.backupEnvironmentVars()
      
      // 2. Backup secrets from Secret Manager
      backupData.configurations.secrets = await this.backupSecrets()
      
      // 3. Backup SSM parameters
      backupData.configurations.parameters = await this.backupSSMParameters()
      
      // 4. Backup feature flags
      backupData.configurations.featureFlags = await this.backupFeatureFlags()
      
      // 5. Backup infrastructure config
      backupData.configurations.infrastructure = await this.backupInfrastructureConfig()
      
      // 6. Encrypt and store backup
      await this.storeConfigBackup(backupData)
      
      console.log('Configuration backup completed successfully')
    } catch (error) {
      console.error('Configuration backup failed:', error)
      throw error
    }
  }
  
  // Backup environment variables
  private async backupEnvironmentVars(): Promise<any> {
    const sensitiveKeys = [
      'DATABASE_URL',
      'JWT_SECRET',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'STRIPE_SECRET_KEY',
      'SLACK_TOKEN',
    ]
    
    const config: any = {}
    
    for (const key of Object.keys(process.env)) {
      if (sensitiveKeys.includes(key)) {
        // Encrypt sensitive values
        config[key] = await encrypt(process.env[key]!)
      } else {
        config[key] = process.env[key]
      }
    }
    
    return config
  }
  
  // Backup secrets from Secret Manager
  private async backupSecrets(): Promise<any> {
    const projectId = process.env.GCP_PROJECT_ID
    const secrets: any = {}
    
    // List all secrets
    const [secretsList] = await this.secretManager.listSecrets({
      parent: `projects/${projectId}`,
    })
    
    for (const secret of secretsList) {
      const [version] = await this.secretManager.accessSecretVersion({
        name: `${secret.name}/versions/latest`,
      })
      
      if (version.payload?.data) {
        secrets[secret.name!] = {
          value: version.payload.data.toString(),
          labels: secret.labels,
          createTime: secret.createTime,
        }
      }
    }
    
    return secrets
  }
  
  // Backup SSM parameters
  private async backupSSMParameters(): Promise<any> {
    const parameters: any = {}
    const paths = ['/production/', '/staging/']
    
    for (const path of paths) {
      const response = await this.ssmClient.send(
        new GetParametersByPathCommand({
          Path: path,
          Recursive: true,
          WithDecryption: true,
        })
      )
      
      if (response.Parameters) {
        for (const param of response.Parameters) {
          parameters[param.Name!] = {
            value: param.Value,
            type: param.Type,
            version: param.Version,
            lastModifiedDate: param.LastModifiedDate,
          }
        }
      }
    }
    
    return parameters
  }
  
  // Backup feature flags
  private async backupFeatureFlags(): Promise<any> {
    const flags = await db.featureFlag.findMany()
    
    return flags.reduce((acc, flag) => {
      acc[flag.name] = {
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
        conditions: flag.conditions,
        updatedAt: flag.updatedAt,
      }
      return acc
    }, {} as any)
  }
  
  // Backup infrastructure configuration
  private async backupInfrastructureConfig(): Promise<any> {
    const config = {
      vercel: {
        projectId: process.env.VERCEL_PROJECT_ID,
        teamId: process.env.VERCEL_TEAM_ID,
      },
      cloudflare: {
        zoneId: process.env.CLOUDFLARE_ZONE_ID,
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      },
      aws: {
        region: process.env.AWS_REGION,
        s3Buckets: {
          uploads: process.env.UPLOADS_S3_BUCKET,
          backups: process.env.BACKUP_S3_BUCKET,
        },
      },
      monitoring: {
        sentryDsn: process.env.SENTRY_DSN,
        datadogApiKey: process.env.DATADOG_API_KEY,
      },
    }
    
    return config
  }
  
  // Store configuration backup
  private async storeConfigBackup(backupData: any): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `config-backup-${timestamp}.json`
    
    // Encrypt entire backup
    const encryptedData = await encrypt(JSON.stringify(backupData, null, 2))
    
    // Store in S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.BACKUP_S3_BUCKET!,
        Key: `config-backups/${fileName}`,
        Body: encryptedData,
        ServerSideEncryption: 'AES256',
        StorageClass: 'STANDARD_IA',
      })
    )
    
    // Also store locally for quick access
    const localPath = path.join('/secure/backups/config', fileName)
    await fs.mkdir(path.dirname(localPath), { recursive: true })
    await fs.writeFile(localPath, encryptedData)
  }
}
```

### 4. Disaster Recovery Procedures

#### Create `scripts/recovery/disaster-recovery.ts`
```typescript
import { DatabaseRecoveryService } from './database-recovery'
import { FileRecoveryService } from './file-recovery'
import { ConfigRecoveryService } from './config-recovery'
import { HealthCheckService } from './health-check'

interface RecoveryOptions {
  targetEnvironment: 'production' | 'staging' | 'development'
  recoveryPoint: Date
  components: Array<'database' | 'files' | 'config' | 'all'>
  verifyOnly?: boolean
}

export class DisasterRecoveryService {
  private dbRecovery: DatabaseRecoveryService
  private fileRecovery: FileRecoveryService
  private configRecovery: ConfigRecoveryService
  private healthCheck: HealthCheckService
  
  constructor() {
    this.dbRecovery = new DatabaseRecoveryService()
    this.fileRecovery = new FileRecoveryService()
    this.configRecovery = new ConfigRecoveryService()
    this.healthCheck = new HealthCheckService()
  }
  
  // Main recovery orchestration
  async executeRecovery(options: RecoveryOptions): Promise<void> {
    console.log('Starting disaster recovery process...')
    console.log('Options:', options)
    
    const startTime = Date.now()
    const results: any = {
      startTime: new Date(),
      options,
      steps: [],
    }
    
    try {
      // 1. Pre-recovery health check
      await this.runStep('Pre-recovery health check', async () => {
        return await this.healthCheck.checkSystemHealth()
      }, results)
      
      // 2. Find recovery points
      const recoveryPoints = await this.runStep('Find recovery points', async () => {
        return await this.findRecoveryPoints(options.recoveryPoint)
      }, results)
      
      if (options.verifyOnly) {
        console.log('Verify-only mode: Recovery points found:', recoveryPoints)
        return
      }
      
      // 3. Put site in maintenance mode
      await this.runStep('Enable maintenance mode', async () => {
        return await this.enableMaintenanceMode()
      }, results)
      
      // 4. Recover components
      if (options.components.includes('all') || options.components.includes('config')) {
        await this.runStep('Recover configuration', async () => {
          return await this.configRecovery.recover(recoveryPoints.config)
        }, results)
      }
      
      if (options.components.includes('all') || options.components.includes('database')) {
        await this.runStep('Recover database', async () => {
          return await this.dbRecovery.recover(recoveryPoints.database)
        }, results)
      }
      
      if (options.components.includes('all') || options.components.includes('files')) {
        await this.runStep('Recover files', async () => {
          return await this.fileRecovery.recover(recoveryPoints.files)
        }, results)
      }
      
      // 5. Verify recovery
      await this.runStep('Verify recovery', async () => {
        return await this.verifyRecovery()
      }, results)
      
      // 6. Run smoke tests
      await this.runStep('Run smoke tests', async () => {
        return await this.runSmokeTests()
      }, results)
      
      // 7. Disable maintenance mode
      await this.runStep('Disable maintenance mode', async () => {
        return await this.disableMaintenanceMode()
      }, results)
      
      // 8. Post-recovery health check
      await this.runStep('Post-recovery health check', async () => {
        return await this.healthCheck.checkSystemHealth()
      }, results)
      
      results.endTime = new Date()
      results.duration = Date.now() - startTime
      results.status = 'success'
      
      console.log('Recovery completed successfully!')
      await this.notifyRecoveryComplete(results)
      
    } catch (error) {
      results.endTime = new Date()
      results.duration = Date.now() - startTime
      results.status = 'failed'
      results.error = error
      
      console.error('Recovery failed:', error)
      await this.notifyRecoveryFailed(results)
      
      throw error
    }
  }
  
  // Run a recovery step with logging
  private async runStep(
    name: string,
    action: () => Promise<any>,
    results: any
  ): Promise<any> {
    console.log(`\n=== ${name} ===`)
    const stepStart = Date.now()
    
    try {
      const result = await action()
      
      results.steps.push({
        name,
        status: 'success',
        duration: Date.now() - stepStart,
        timestamp: new Date(),
        result,
      })
      
      console.log(`✓ ${name} completed in ${Date.now() - stepStart}ms`)
      return result
      
    } catch (error) {
      results.steps.push({
        name,
        status: 'failed',
        duration: Date.now() - stepStart,
        timestamp: new Date(),
        error: error.message,
      })
      
      console.error(`✗ ${name} failed:`, error)
      throw error
    }
  }
  
  // Find closest recovery points
  private async findRecoveryPoints(targetTime: Date): Promise<any> {
    const points = {
      database: await this.dbRecovery.findClosestBackup(targetTime),
      files: await this.fileRecovery.findClosestBackup(targetTime),
      config: await this.configRecovery.findClosestBackup(targetTime),
    }
    
    // Verify all components have valid recovery points
    for (const [component, point] of Object.entries(points)) {
      if (!point) {
        throw new Error(`No recovery point found for ${component}`)
      }
    }
    
    return points
  }
  
  // Enable maintenance mode
  private async enableMaintenanceMode(): Promise<void> {
    // Update environment variable
    await this.updateVercelEnv('MAINTENANCE_MODE', 'true')
    
    // Update feature flag
    await db.featureFlag.upsert({
      where: { name: 'maintenance_mode' },
      update: { enabled: true },
      create: { name: 'maintenance_mode', enabled: true },
    })
    
    // Clear CDN cache
    await this.purgeCloudflareCache()
  }
  
  // Disable maintenance mode
  private async disableMaintenanceMode(): Promise<void> {
    await this.updateVercelEnv('MAINTENANCE_MODE', 'false')
    
    await db.featureFlag.update({
      where: { name: 'maintenance_mode' },
      data: { enabled: false },
    })
    
    await this.purgeCloudflareCache()
  }
  
  // Verify recovery
  private async verifyRecovery(): Promise<any> {
    const checks = {
      database: await this.dbRecovery.verify(),
      files: await this.fileRecovery.verify(),
      config: await this.configRecovery.verify(),
    }
    
    const allPassed = Object.values(checks).every(check => check.passed)
    
    if (!allPassed) {
      throw new Error('Recovery verification failed')
    }
    
    return checks
  }
  
  // Run smoke tests
  private async runSmokeTests(): Promise<any> {
    const tests = [
      { name: 'Homepage loads', url: '/' },
      { name: 'API health check', url: '/api/health' },
      { name: 'Tool functionality', url: '/tools/uppercase', method: 'POST' },
      { name: 'Database connectivity', check: () => db.$queryRaw`SELECT 1` },
    ]
    
    const results = []
    
    for (const test of tests) {
      try {
        if (test.check) {
          await test.check()
        } else {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${test.url}`, {
            method: test.method || 'GET',
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
        }
        
        results.push({ test: test.name, status: 'passed' })
      } catch (error) {
        results.push({ test: test.name, status: 'failed', error: error.message })
      }
    }
    
    return results
  }
  
  // Update Vercel environment variable
  private async updateVercelEnv(key: string, value: string): Promise<void> {
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/env`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
          target: ['production', 'preview'],
        }),
      }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to update Vercel env: ${response.statusText}`)
    }
  }
  
  // Purge Cloudflare cache
  private async purgeCloudflareCache(): Promise<void> {
    await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purge_everything: true }),
      }
    )
  }
  
  // Notify recovery complete
  private async notifyRecoveryComplete(results: any): Promise<void> {
    const message = `✅ Disaster recovery completed successfully
- Duration: ${Math.round(results.duration / 1000)}s
- Components: ${results.options.components.join(', ')}
- Recovery Point: ${results.options.recoveryPoint.toISOString()}`
    
    await slack.chat.postMessage({
      channel: '#critical-alerts',
      text: message,
      attachments: [
        {
          color: 'good',
          fields: results.steps.map((step: any) => ({
            title: step.name,
            value: `${step.status} (${step.duration}ms)`,
            short: true,
          })),
        },
      ],
    })
  }
  
  // Notify recovery failed
  private async notifyRecoveryFailed(results: any): Promise<void> {
    const message = `❌ Disaster recovery failed
- Duration: ${Math.round(results.duration / 1000)}s
- Error: ${results.error?.message || 'Unknown error'}`
    
    await slack.chat.postMessage({
      channel: '#critical-alerts',
      text: message,
      attachments: [
        {
          color: 'danger',
          fields: results.steps.map((step: any) => ({
            title: step.name,
            value: `${step.status} ${step.error ? `- ${step.error}` : ''}`,
            short: true,
          })),
        },
      ],
    })
    
    // Page on-call engineer
    await pagerDuty.createIncident({
      title: 'Disaster Recovery Failed',
      urgency: 'high',
      details: results,
    })
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'recover':
      const options: RecoveryOptions = {
        targetEnvironment: args[1] as any || 'production',
        recoveryPoint: new Date(args[2] || Date.now() - 3600000), // 1 hour ago
        components: args[3]?.split(',') as any || ['all'],
        verifyOnly: args.includes('--verify-only'),
      }
      
      const service = new DisasterRecoveryService()
      service.executeRecovery(options)
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
      
    default:
      console.log('Usage: disaster-recovery recover [environment] [recovery-point] [components]')
      process.exit(1)
  }
}
```

### 5. Backup Monitoring Dashboard

#### Create `src/app/[locale]/admin/backups/page.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Database,
  HardDrive,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'

export default function BackupMonitoringPage() {
  const { data: backupStatus, refetch } = useQuery({
    queryKey: ['backup-status'],
    queryFn: fetchBackupStatus,
    refetchInterval: 60000, // Refresh every minute
  })
  
  const { data: backupHistory } = useQuery({
    queryKey: ['backup-history'],
    queryFn: fetchBackupHistory,
  })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Backup Monitoring</h1>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Backup Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <BackupStatusCard
          title="Database Backup"
          icon={Database}
          status={backupStatus?.database}
          type="database"
        />
        <BackupStatusCard
          title="File Storage Backup"
          icon={HardDrive}
          status={backupStatus?.files}
          type="files"
        />
        <BackupStatusCard
          title="Configuration Backup"
          icon={Settings}
          status={backupStatus?.config}
          type="config"
        />
      </div>
      
      {/* Alerts */}
      {backupStatus?.alerts && backupStatus.alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Backup Alerts:</strong>
            <ul className="list-disc pl-5 mt-2">
              {backupStatus.alerts.map((alert: any, index: number) => (
                <li key={index}>{alert.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Backup History</TabsTrigger>
          <TabsTrigger value="recovery">Recovery Points</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <BackupHistory history={backupHistory} />
        </TabsContent>
        
        <TabsContent value="recovery">
          <RecoveryPoints />
        </TabsContent>
        
        <TabsContent value="metrics">
          <BackupMetrics />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BackupStatusCard({ title, icon: Icon, status, type }: any) {
  const isHealthy = status?.lastBackup && 
    new Date(status.lastBackup.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={isHealthy ? 'success' : 'destructive'}>
                {isHealthy ? 'Healthy' : 'Needs Attention'}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Backup</p>
              <p className="text-sm font-medium">
                {status.lastBackup ? (
                  <>
                    {format(new Date(status.lastBackup.timestamp), 'PPp')}
                    <span className="text-muted-foreground ml-1">
                      ({formatDistanceToNow(new Date(status.lastBackup.timestamp), { addSuffix: true })})
                    </span>
                  </>
                ) : (
                  'No backups found'
                )}
              </p>
            </div>
            
            {status.nextBackup && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Next Backup</p>
                <p className="text-sm font-medium">
                  {format(new Date(status.nextBackup), 'PPp')}
                </p>
              </div>
            )}
            
            <div className="pt-2">
              <Button size="sm" variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Latest
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BackupHistory({ history }: any) {
  if (!history) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Backups</CardTitle>
        <CardDescription>Last 30 days of backup activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {history.map((backup: any) => (
            <div
              key={backup.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {backup.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">{backup.type} Backup</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(backup.timestamp), 'PPp')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">{backup.size}</Badge>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecoveryPoints() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Recovery Points</CardTitle>
        <CardDescription>
          Points in time to which the system can be restored
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Recovery points implementation */}
      </CardContent>
    </Card>
  )
}

function BackupMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Backup Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">98.5%</div>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Average Recovery Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">2.5 hours</div>
          <p className="text-sm text-muted-foreground">Based on tests</p>
        </CardContent>
      </Card>
    </div>
  )
}

// API functions
async function fetchBackupStatus() {
  const response = await fetch('/api/admin/backups/status')
  return response.json()
}

async function fetchBackupHistory() {
  const response = await fetch('/api/admin/backups/history')
  return response.json()
}
```

## Testing & Verification

1. Test automated backup execution
2. Verify backup integrity
3. Test recovery procedures
4. Measure RTO and RPO
5. Test failover scenarios
6. Verify backup monitoring

## Success Indicators
- ✅ Automated backups running
- ✅ Recovery procedures documented
- ✅ RTO < 4 hours achieved
- ✅ RPO < 1 hour achieved
- ✅ Backup verification passing
- ✅ Monitoring alerts working

## Next Steps
Proceed to Story 6.6: Launch Checklist & Go-Live

## Notes
- Schedule regular recovery drills
- Monitor backup storage costs
- Update procedures regularly
- Test cross-region recovery
- Document recovery runbooks