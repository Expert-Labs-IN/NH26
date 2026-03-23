const fs = require('fs');
const path = require('path');

const apis = ['stats', 'merchant', 'velocity', 'travel', 'cities', 'heatmap', 'threshold', 'offenders', 'feed', 'citypairs'];

apis.forEach(api => {
    const dir = path.join(__dirname, '../src/app/api', api);
    fs.mkdirSync(dir, { recursive: true });
    
    let mockKey = api + 'Data';
    if(api === 'cities') mockKey = 'cityFraudData';
    
    fs.writeFileSync(path.join(dir, 'route.ts'), `import { NextResponse } from 'next/server';\nimport { ${mockKey} } from '@/lib/mockData';\n\nexport async function GET() {\n  return NextResponse.json(${mockKey});\n}\n`);
});

const insightDir = path.join(__dirname, '../src/app/api/insight');
fs.mkdirSync(insightDir, { recursive: true });
fs.writeFileSync(path.join(insightDir, 'route.ts'), `import { NextResponse } from 'next/server';\n\nexport async function GET() {\n  return NextResponse.json({\n    critical: "Multiple repeat offenders remain active",\n    pattern: "Fraud concentrated in specific merchant categories",\n    recommend: "Apply threshold-based filtering"\n  });\n}\n`);
