Diagnose performance issues
41
Performance
96
Accessibility
100
Best Practices
100
SEO
41
FCP
+1
LCP
+1
TBT
+29
CLS
+5
SI
+5
Performance
Values are estimated and may vary. The performance score is calculated directly from these metrics.See calculator.
0–49
50–89
90–100
Final Screenshot

Metrics
Expand view
First Contentful Paint
5.3 s
Largest Contentful Paint
7.3 s
Total Blocking Time
120 ms
Cumulative Layout Shift
0.454
Speed Index
5.7 s
Captured at Oct 8, 2025, 2:21 PM GMT+1
Emulated Moto G Power with Lighthouse 12.8.2
Single page session
Initial page load
Slow 4G throttling
Using HeadlessChromium 137.0.7151.119 with lr


Insights
Render blocking requests Est savings of 280 ms
Requests are blocking the page's initial render, which may delay LCP. Deferring or inlining can move these network requests out of the critical path.LCPFCP
URL
Transfer Size
Duration
textcaseconverter.net 1st party
18.8 KiB	1,410 ms
…css/de70bee13400563f.css(textcaseconverter.net)
1.2 KiB
180 ms
…css/8458370db9d9ad85.css(textcaseconverter.net)
17.6 KiB
1,230 ms
Use efficient cache lifetimes Est savings of 10 KiB
A long cache lifetime can speed up repeat visits to your page. Learn more.LCPFCP
Request
Cache TTL
Transfer Size
Google/Doubleclick Ads ad 
12 KiB
/pagead/show_companion_ad.js?fcd=true(pagead2.googlesyndication.com)
1h
12 KiB
Legacy JavaScript Est savings of 12 KiB
Polyfills and transforms enable older browsers to use new JavaScript features. However, many aren't necessary for modern browsers. Consider modifying your JavaScript build process to not transpile Baseline features, unless you know you must support older browsers. Learn why most sites can deploy ES6+ code without transpilingLCPFCP
URL
Wasted bytes
textcaseconverter.net 1st party
11.6 KiB
…chunks/5964-6588d8a0d7084b0c.js(textcaseconverter.net)
11.6 KiB
…chunks/5964-6588d8a0d7084b0c.js:1:103057(textcaseconverter.net)
Array.prototype.at
…chunks/5964-6588d8a0d7084b0c.js:1:102445(textcaseconverter.net)
Array.prototype.flat
…chunks/5964-6588d8a0d7084b0c.js:1:102558(textcaseconverter.net)
Array.prototype.flatMap
…chunks/5964-6588d8a0d7084b0c.js:1:102934(textcaseconverter.net)
Object.fromEntries
…chunks/5964-6588d8a0d7084b0c.js:1:103192(textcaseconverter.net)
Object.hasOwn
…chunks/5964-6588d8a0d7084b0c.js:1:102187(textcaseconverter.net)
String.prototype.trimEnd
…chunks/5964-6588d8a0d7084b0c.js:1:102102(textcaseconverter.net)
String.prototype.trimStart
Layout shift culprits
Layout shifts occur when elements move absent any user interaction. Investigate the causes of layout shifts, such as elements being added, removed, or their fonts changing as the page loads.CLS
Element
Layout shift score
Total
0.454
Input Text Output Text original uppercase lowercase titlecase sentencecase came…
<div class="space-y-4">
0.454
Forced reflow
A forced reflow occurs when JavaScript queries geometric properties (such as offsetWidth) after styles have been invalidated by a change to the DOM state. This can result in poor performance. Learn more about forced reflows and possible mitigations.
Source
Total reflow time
…m202…/show_ads_impl_with_ama_fy2021.js?client=…:834:256(pagead2.googlesyndication.com)
70 ms
…m202…/show_ads_impl_with_ama_fy2021.js?client=…:813:307(pagead2.googlesyndication.com)
0 ms
…m202…/show_ads_impl_with_ama_fy2021.js?client=…:477:500(pagead2.googlesyndication.com)
47 ms
[unattributed]
35 ms
Network dependency tree
Avoid chaining critical requests by reducing the length of chains, reducing the download size of resources, or deferring the download of unnecessary resources to improve page load.LCP
Maximum critical path latency: 841 ms
Initial Navigation
https://textcaseconverter.net - 136 ms, 11.49 KiB
…css/de70bee13400563f.css(textcaseconverter.net) - 462 ms, 1.20 KiB
…media/8d697b304b401681-s.woff2(textcaseconverter.net) - 841 ms, 14.89 KiB
…css/8458370db9d9ad85.css(textcaseconverter.net) - 220 ms, 17.64 KiB
Preconnected origins
preconnect hints help the browser establish a connection earlier in the page load, saving time when the first request for that origin is made. The following are the origins that the page preconnected to.
no origins were preconnected
Preconnect candidates
Add preconnect hints to your most important origins, but try to use no more than 4.
No additional origins are good candidates for preconnecting

Diagnostics
Reduce unused JavaScript Est savings of 197 KiB
Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity. Learn how to reduce unused JavaScript.LCPFCP
URL
Transfer Size
Est Savings
Google/Doubleclick Ads ad 
219.8 KiB	109.0 KiB
…m202…/show_ads_impl_with_ama_fy2021.js?client=…(pagead2.googlesyndication.com)
166.9 KiB
85.5 KiB
…js/adsbygoogle.js?client=ca-pub-889…(pagead2.googlesyndication.com)
52.9 KiB
23.6 KiB
Google Tag Manager tag-manager 
137.6 KiB	53.4 KiB
/gtag/js?id=G-1DT1KPX3XQ(www.googletagmanager.com)
137.6 KiB
53.4 KiB
Google FundingChoices consent-provider 
65.8 KiB	35.1 KiB
/i/ca-pub-88…?href=https%3A%2F%2Ftextcaseconverter.net&ers=2(fundingchoicesmessages.google.com)
65.8 KiB
35.1 KiB



Reduce JavaScript execution time 1.4 s
Consider reducing the time spent parsing, compiling, and executing JS. You may find delivering smaller JS payloads helps with this. Learn how to reduce Javascript execution time.TBT
URL
Total CPU Time
Script Evaluation
Script Parse
Google/Doubleclick Ads ad 
711 ms	385 ms	109 ms
…m202…/show_ads_impl_with_ama_fy2021.js?client=…(pagead2.googlesyndication.com)
598 ms
303 ms
86 ms
…js/adsbygoogle.js?client=ca-pub-889…(pagead2.googlesyndication.com)
113 ms
83 ms
22 ms
textcaseconverter.net 1st party
609 ms	456 ms	19 ms
…chunks/5964-6588d8a0d7084b0c.js(textcaseconverter.net)
478 ms
446 ms
15 ms
https://textcaseconverter.net
131 ms
10 ms
4 ms
Google FundingChoices consent-provider 
247 ms	153 ms	29 ms
/i/ca-pub-88…?href=https%3A%2F%2Ftextcaseconverter.net&ers=2(fundingchoicesmessages.google.com)
247 ms
153 ms
29 ms
Unattributable
220 ms	5 ms	0 ms
Unattributable
220 ms
5 ms
0 ms
Google Tag Manager tag-manager 
205 ms	136 ms	68 ms
/gtag/js?id=G-1DT1KPX3XQ(www.googletagmanager.com)
205 ms
136 ms
68 ms



Minimize main-thread work 2.5 s
Consider reducing the time spent parsing, compiling and executing JS. You may find delivering smaller JS payloads helps with this. Learn how to minimize main-thread workTBT
Category
Time Spent
Script Evaluation
1,525 ms
Style & Layout
341 ms
Script Parsing & Compilation
295 ms
Other
244 ms
Garbage Collection
50 ms
Parse HTML & CSS
24 ms
Rendering
23 ms


Avoid serving legacy JavaScript to modern browsers Est savings of 11 KiB
Polyfills and transforms enable legacy browsers to use new JavaScript features. However, many aren't necessary for modern browsers. Consider modifying your JavaScript build process to not transpile Baseline features, unless you know you must support legacy browsers. Learn why most sites can deploy ES6+ code without transpilingLCPFCP
URL
Est Savings
textcaseconverter.net 1st party
11.4 KiB
…chunks/5964-6588d8a0d7084b0c.js(textcaseconverter.net)
11.4 KiB
…chunks/5964-6588d8a0d7084b0c.js:1:103057(textcaseconverter.net)
Array.prototype.at
…chunks/5964-6588d8a0d7084b0c.js:1:102445(textcaseconverter.net)
Array.prototype.flat
…chunks/5964-6588d8a0d7084b0c.js:1:102558(textcaseconverter.net)
Array.prototype.flatMap
…chunks/5964-6588d8a0d7084b0c.js:1:102934(textcaseconverter.net)
Object.fromEntries
…chunks/5964-6588d8a0d7084b0c.js:1:103192(textcaseconverter.net)
Object.hasOwn
…chunks/5964-6588d8a0d7084b0c.js:1:102187(textcaseconverter.net)
String.prototype.trimEnd
…chunks/5964-6588d8a0d7084b0c.js:1:102102(textcaseconverter.net)
String.prototype.trimStart


