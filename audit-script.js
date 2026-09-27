const fs = require('fs');
const path = require('path');

const phrases = [
  "100%", "ปลอดภัย 100%", "สมบูรณ์แบบ", "ดีที่สุด", "อันดับ 1", 
  "เร็วที่สุด", "คมชัดเหมือนเดิม", "สแกนติดทุกแอป", "ผ่านฉลุย", 
  "รับประกัน", "ไม่มีข้อผิดพลาด", "ไฟล์ทั้งหมดไม่ออกจากเครื่อง"
];

function searchFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results.push(...searchFiles(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        for (const phrase of phrases) {
          if (line.includes(phrase)) {
            results.push(`${fullPath}:${index + 1}: ${line.trim()}`);
          }
        }
      });
    }
  }
  return results;
}

const matches = searchFiles(path.join(__dirname, 'src', 'app'));
fs.writeFileSync('audit-claims.txt', matches.join('\n'));
console.log(`Found ${matches.length} matches.`);
