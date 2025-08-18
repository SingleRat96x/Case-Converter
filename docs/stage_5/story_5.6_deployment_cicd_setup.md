# Story 5.6: Deployment & CI/CD Setup

## Story Details
- **Stage**: 5 - Integration, Testing & Performance
- **Priority**: Critical
- **Estimated Hours**: 4-6 hours
- **Dependencies**: Stories 5.1-5.5 Complete

## Objective
Set up a robust CI/CD pipeline with automated testing, security scanning, and deployment to production. Configure staging and production environments with proper monitoring, rollback capabilities, and zero-downtime deployments.

## Acceptance Criteria
- [ ] GitHub Actions CI/CD pipeline
- [ ] Automated testing on pull requests
- [ ] Security vulnerability scanning
- [ ] Code quality checks
- [ ] Staging environment deployment
- [ ] Production deployment with approval
- [ ] Zero-downtime deployments
- [ ] Automatic rollback on failures
- [ ] Environment variable management
- [ ] Database migration automation
- [ ] Monitoring and alerting setup
- [ ] Deployment notifications

## Implementation Steps

### 1. GitHub Actions CI/CD Pipeline

#### Create `.github/workflows/ci.yml`
```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20.x'
  PNPM_VERSION: 8

jobs:
  # Code quality checks
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run ESLint
        run: pnpm lint
      
      - name: Check formatting
        run: pnpm prettier --check .
      
      - name: Type check
        run: pnpm tsc --noEmit

  # Unit and integration tests
  test:
    name: Test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm test:ci --shard=${{ matrix.shard }}/4
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

  # E2E tests
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps
      
      - name: Build application
        run: pnpm build
        env:
          NEXT_PUBLIC_BASE_URL: http://localhost:3000
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  # Security scanning
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: Run npm audit
        run: pnpm audit --production
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  # Build and analyze
  build:
    name: Build & Analyze
    runs-on: ubuntu-latest
    needs: [lint, test, security]
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build application
        run: pnpm build
        env:
          NEXT_PUBLIC_BASE_URL: ${{ secrets.PRODUCTION_URL }}
          ANALYZE: true
      
      - name: Analyze bundle size
        run: |
          echo "## Bundle Analysis 📊" >> $GITHUB_STEP_SUMMARY
          echo "| Route | Size | First Load JS |" >> $GITHUB_STEP_SUMMARY
          echo "|-------|------|---------------|" >> $GITHUB_STEP_SUMMARY
          cat .next/analyze/*.json | jq -r '.[] | "| \(.route) | \(.size) | \(.firstLoadJS) |"' >> $GITHUB_STEP_SUMMARY
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            .next/
            public/
          retention-days: 7

  # Lighthouse CI
  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/tools/uppercase
            http://localhost:3000/fr
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### 2. Deployment Workflow

#### Create `.github/workflows/deploy.yml`
```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  # Deploy to staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && (github.event_name == 'push' || github.event.inputs.environment == 'staging')
    environment:
      name: staging
      url: https://staging.textcaseconverter.com
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: staging.textcaseconverter.com
      
      - name: Run database migrations
        run: |
          pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
      
      - name: Warm up cache
        run: |
          curl -s https://staging.textcaseconverter.com > /dev/null
          curl -s https://staging.textcaseconverter.com/api/v1/tools > /dev/null
      
      - name: Run smoke tests
        run: |
          pnpm test:smoke --url=https://staging.textcaseconverter.com
      
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()

  # Deploy to production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.event.inputs.environment == 'production'
    environment:
      name: production
      url: https://textcaseconverter.com
    steps:
      - uses: actions/checkout@v4
      
      - name: Create deployment
        uses: chrnorm/deployment-action@v2
        id: deployment
        with:
          token: ${{ github.token }}
          environment: production
          description: 'Production deployment'
      
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        id: vercel-deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
      
      - name: Run database migrations
        run: |
          # Create backup first
          pg_dump ${{ secrets.PRODUCTION_DATABASE_URL }} > backup-$(date +%Y%m%d-%H%M%S).sql
          
          # Run migrations
          pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
      
      - name: Purge CDN cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}'
      
      - name: Run health checks
        run: |
          # Check main page
          curl -f https://textcaseconverter.com || exit 1
          
          # Check API
          curl -f https://textcaseconverter.com/api/v1 || exit 1
          
          # Check critical tools
          curl -f https://textcaseconverter.com/tools/uppercase || exit 1
      
      - name: Update deployment status
        uses: chrnorm/deployment-status@v2
        if: always()
        with:
          token: ${{ github.token }}
          deployment-id: ${{ steps.deployment.outputs.deployment_id }}
          state: ${{ job.status }}
          environment-url: https://textcaseconverter.com
      
      - name: Create release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release ${{ github.run_number }}
          body: |
            ## Changes
            ${{ github.event.head_commit.message }}
            
            ## Deployment
            - Environment: Production
            - URL: https://textcaseconverter.com
            - Vercel URL: ${{ steps.vercel-deploy.outputs.preview-url }}
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Production deployment ${{ job.status }}
            Version: v${{ github.run_number }}
            Deployed by: ${{ github.actor }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

### 3. Environment Configuration

#### Create `.github/workflows/env-sync.yml`
```yaml
name: Sync Environment Variables

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday

jobs:
  sync-env:
    name: Sync Environment Variables
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm i -g vercel@latest
      
      - name: Pull production env
        run: |
          vercel env pull .env.production --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Pull staging env
        run: |
          vercel env pull .env.staging --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Validate env files
        run: |
          # Check required variables
          required_vars=(
            "DATABASE_URL"
            "NEXT_PUBLIC_BASE_URL"
            "JWT_SECRET"
            "GOOGLE_ANALYTICS_ID"
          )
          
          for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" .env.production; then
              echo "Missing $var in production env"
              exit 1
            fi
          done
      
      - name: Encrypt and store
        run: |
          # Encrypt env files
          gpg --symmetric --cipher-algo AES256 .env.production
          gpg --symmetric --cipher-algo AES256 .env.staging
          
          # Store in secure location
          aws s3 cp .env.production.gpg s3://textcaseconverter-secrets/
          aws s3 cp .env.staging.gpg s3://textcaseconverter-secrets/
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### 4. Database Migration Automation

#### Create `scripts/migrate.ts`
```typescript
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'
import * as fs from 'fs/promises'

const prisma = new PrismaClient()

interface Migration {
  id: string
  checksum: string
  appliedAt: Date
  duration: number
}

async function runMigrations() {
  console.log('🚀 Starting database migration...')
  
  try {
    // Check connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Create migrations table if not exists
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS _migrations (
        id VARCHAR(255) PRIMARY KEY,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration INTEGER NOT NULL
      )
    `
    
    // Get pending migrations
    const migrationFiles = await fs.readdir('./prisma/migrations')
    const appliedMigrations = await prisma.$queryRaw<Migration[]>`
      SELECT * FROM _migrations
    `
    
    const pendingMigrations = migrationFiles.filter(file => {
      return !appliedMigrations.some(m => m.id === file)
    })
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations')
      return
    }
    
    console.log(`📝 Found ${pendingMigrations.length} pending migrations`)
    
    // Run each migration
    for (const migration of pendingMigrations) {
      console.log(`Running migration: ${migration}`)
      const start = Date.now()
      
      try {
        // Read migration file
        const sql = await fs.readFile(
          `./prisma/migrations/${migration}/migration.sql`,
          'utf-8'
        )
        
        // Calculate checksum
        const checksum = createHash('sha256').update(sql).digest('hex')
        
        // Execute migration
        await prisma.$executeRawUnsafe(sql)
        
        // Record migration
        await prisma.$executeRaw`
          INSERT INTO _migrations (id, checksum, duration)
          VALUES (${migration}, ${checksum}, ${Date.now() - start})
        `
        
        console.log(`✅ Migration ${migration} completed in ${Date.now() - start}ms`)
      } catch (error) {
        console.error(`❌ Migration ${migration} failed:`, error)
        throw error
      }
    }
    
    console.log('✅ All migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Rollback function
async function rollbackMigration(steps = 1) {
  console.log(`🔄 Rolling back ${steps} migration(s)...`)
  
  try {
    const migrations = await prisma.$queryRaw<Migration[]>`
      SELECT * FROM _migrations
      ORDER BY applied_at DESC
      LIMIT ${steps}
    `
    
    for (const migration of migrations) {
      console.log(`Rolling back: ${migration.id}`)
      
      // Read down migration
      const downSql = await fs.readFile(
        `./prisma/migrations/${migration.id}/down.sql`,
        'utf-8'
      )
      
      // Execute rollback
      await prisma.$executeRawUnsafe(downSql)
      
      // Remove migration record
      await prisma.$executeRaw`
        DELETE FROM _migrations WHERE id = ${migration.id}
      `
      
      console.log(`✅ Rolled back ${migration.id}`)
    }
  } catch (error) {
    console.error('❌ Rollback failed:', error)
    process.exit(1)
  }
}

// CLI
const command = process.argv[2]

switch (command) {
  case 'up':
    runMigrations()
    break
  case 'down':
    rollbackMigration(parseInt(process.argv[3] || '1'))
    break
  default:
    console.log('Usage: pnpm migrate [up|down] [steps]')
}
```

### 5. Monitoring Setup

#### Create `scripts/setup-monitoring.ts`
```typescript
import { Client } from '@elastic/elasticsearch'
import * as Sentry from '@sentry/node'
import { WebClient } from '@slack/web-api'
import { CloudWatchClient, PutMetricAlarmCommand } from '@aws-sdk/client-cloudwatch'

// Initialize monitoring services
const elastic = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY!,
  },
})

const slack = new WebClient(process.env.SLACK_TOKEN)
const cloudwatch = new CloudWatchClient({ region: 'us-east-1' })

// Setup Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})

// Setup CloudWatch alarms
async function setupAlarms() {
  const alarms = [
    {
      name: 'HighErrorRate',
      metric: 'ErrorRate',
      threshold: 1, // 1% error rate
      evaluationPeriods: 2,
      period: 300, // 5 minutes
    },
    {
      name: 'HighResponseTime',
      metric: 'ResponseTime',
      threshold: 1000, // 1 second
      evaluationPeriods: 3,
      period: 60,
    },
    {
      name: 'LowAvailability',
      metric: 'Availability',
      threshold: 99.9,
      comparisonOperator: 'LessThanThreshold',
      evaluationPeriods: 2,
      period: 300,
    },
    {
      name: 'HighMemoryUsage',
      metric: 'MemoryUtilization',
      threshold: 90, // 90%
      evaluationPeriods: 2,
      period: 300,
    },
  ]
  
  for (const alarm of alarms) {
    await cloudwatch.send(
      new PutMetricAlarmCommand({
        AlarmName: `TextCaseConverter-${alarm.name}`,
        MetricName: alarm.metric,
        Namespace: 'TextCaseConverter',
        Statistic: 'Average',
        Period: alarm.period,
        EvaluationPeriods: alarm.evaluationPeriods,
        Threshold: alarm.threshold,
        ComparisonOperator: alarm.comparisonOperator || 'GreaterThanThreshold',
        AlarmActions: [process.env.SNS_TOPIC_ARN!],
      })
    )
  }
}

// Setup Elasticsearch indices
async function setupElasticsearch() {
  // Application logs index
  await elastic.indices.create({
    index: 'textcaseconverter-logs',
    body: {
      mappings: {
        properties: {
          timestamp: { type: 'date' },
          level: { type: 'keyword' },
          message: { type: 'text' },
          service: { type: 'keyword' },
          trace_id: { type: 'keyword' },
          user_id: { type: 'keyword' },
          ip: { type: 'ip' },
          user_agent: { type: 'text' },
          response_time: { type: 'float' },
          status_code: { type: 'integer' },
        },
      },
    },
  })
  
  // Performance metrics index
  await elastic.indices.create({
    index: 'textcaseconverter-metrics',
    body: {
      mappings: {
        properties: {
          timestamp: { type: 'date' },
          metric: { type: 'keyword' },
          value: { type: 'float' },
          tags: { type: 'object' },
        },
      },
    },
  })
}

// Setup deployment notifications
export async function notifyDeployment(
  environment: string,
  version: string,
  status: 'started' | 'completed' | 'failed',
  details?: any
) {
  const color = status === 'completed' ? 'good' : status === 'failed' ? 'danger' : 'warning'
  
  await slack.chat.postMessage({
    channel: '#deployments',
    attachments: [
      {
        color,
        title: `Deployment ${status}: ${environment}`,
        fields: [
          {
            title: 'Version',
            value: version,
            short: true,
          },
          {
            title: 'Environment',
            value: environment,
            short: true,
          },
          {
            title: 'Timestamp',
            value: new Date().toISOString(),
            short: true,
          },
          ...(details ? [
            {
              title: 'Details',
              value: JSON.stringify(details, null, 2),
              short: false,
            },
          ] : []),
        ],
      },
    ],
  })
  
  // Also send to Sentry
  if (status === 'completed') {
    Sentry.captureMessage(`Deployment completed: ${environment} v${version}`, 'info')
  } else if (status === 'failed') {
    Sentry.captureException(new Error(`Deployment failed: ${environment} v${version}`))
  }
}

// Health check endpoint
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy'
  checks: Record<string, boolean>
  timestamp: string
}> {
  const checks = {
    database: false,
    redis: false,
    elasticsearch: false,
    sentry: false,
  }
  
  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch {}
  
  // Check Elasticsearch
  try {
    await elastic.ping()
    checks.elasticsearch = true
  } catch {}
  
  // Check Sentry
  try {
    Sentry.captureMessage('Health check', 'debug')
    checks.sentry = true
  } catch {}
  
  const allHealthy = Object.values(checks).every(v => v)
  
  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  }
}

// Run setup
if (require.main === module) {
  Promise.all([
    setupAlarms(),
    setupElasticsearch(),
  ])
    .then(() => {
      console.log('✅ Monitoring setup completed')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Monitoring setup failed:', error)
      process.exit(1)
    })
}
```

### 6. Zero-Downtime Deployment Script

#### Create `scripts/deploy.sh`
```bash
#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
ENVIRONMENT=$1
VERSION=$2
HEALTH_CHECK_URL=""
ROLLBACK_ON_FAILURE=true

# Validate inputs
if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
  echo -e "${RED}Usage: ./deploy.sh [staging|production] [version]${NC}"
  exit 1
fi

# Set environment-specific variables
if [ "$ENVIRONMENT" = "production" ]; then
  HEALTH_CHECK_URL="https://textcaseconverter.com/api/health"
  DEPLOYMENT_URL="https://textcaseconverter.com"
else
  HEALTH_CHECK_URL="https://staging.textcaseconverter.com/api/health"
  DEPLOYMENT_URL="https://staging.textcaseconverter.com"
fi

echo -e "${YELLOW}Starting deployment to $ENVIRONMENT (v$VERSION)...${NC}"

# Pre-deployment checks
echo "Running pre-deployment checks..."

# Check if version exists
if ! git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo -e "${RED}Version $VERSION does not exist${NC}"
  exit 1
fi

# Backup current deployment
echo "Creating backup..."
BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"
git tag "$BACKUP_TAG"
git push origin "$BACKUP_TAG"

# Deploy new version
echo "Deploying version $VERSION..."
vercel --prod --env="$ENVIRONMENT" --force

# Wait for deployment to be ready
echo "Waiting for deployment to be ready..."
sleep 30

# Health checks
echo "Running health checks..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -f "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}Health check passed${NC}"
    break
  else
    echo "Health check failed, retrying... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 10
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo -e "${RED}Health checks failed${NC}"
  
  if [ "$ROLLBACK_ON_FAILURE" = true ]; then
    echo "Rolling back deployment..."
    vercel rollback --env="$ENVIRONMENT"
    exit 1
  fi
fi

# Run smoke tests
echo "Running smoke tests..."
pnpm test:smoke --url="$DEPLOYMENT_URL"

if [ $? -ne 0 ]; then
  echo -e "${RED}Smoke tests failed${NC}"
  
  if [ "$ROLLBACK_ON_FAILURE" = true ]; then
    echo "Rolling back deployment..."
    vercel rollback --env="$ENVIRONMENT"
    exit 1
  fi
fi

# Update DNS (production only)
if [ "$ENVIRONMENT" = "production" ]; then
  echo "Updating DNS records..."
  # Update Cloudflare DNS
  curl -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$DNS_RECORD_ID" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"CNAME\",\"name\":\"@\",\"content\":\"$VERCEL_URL\",\"ttl\":1,\"proxied\":true}"
fi

# Clear CDN cache
echo "Clearing CDN cache..."
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Warm up cache
echo "Warming up cache..."
curl -s "$DEPLOYMENT_URL" > /dev/null
curl -s "$DEPLOYMENT_URL/api/v1/tools" > /dev/null
curl -s "$DEPLOYMENT_URL/sitemap.xml" > /dev/null

# Notify team
echo "Sending notifications..."
curl -X POST "$SLACK_WEBHOOK" \
  -H 'Content-Type: application/json' \
  -d "{
    \"text\": \"Deployment completed successfully!\",
    \"attachments\": [{
      \"color\": \"good\",
      \"fields\": [
        {\"title\": \"Environment\", \"value\": \"$ENVIRONMENT\", \"short\": true},
        {\"title\": \"Version\", \"value\": \"$VERSION\", \"short\": true},
        {\"title\": \"URL\", \"value\": \"$DEPLOYMENT_URL\", \"short\": false}
      ]
    }]
  }"

echo -e "${GREEN}Deployment completed successfully!${NC}"
```

## Testing & Verification

1. Test CI pipeline on pull request
2. Verify automated tests run
3. Check security scanning results
4. Test staging deployment
5. Verify rollback functionality
6. Check monitoring alerts

## Success Indicators
- ✅ CI/CD pipeline running on all PRs
- ✅ Automated deployments to staging
- ✅ Zero-downtime deployments working
- ✅ Rollback capability tested
- ✅ Monitoring and alerts configured
- ✅ Team notifications working

## Next Steps
Project deployment complete! Monitor and iterate.

## Notes
- Regular review of CI/CD performance
- Update dependencies regularly
- Monitor deployment metrics
- Implement canary deployments
- Add performance regression tests