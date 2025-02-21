const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/icon.svg'));
  
  // 生成 favicon (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFormat('png')
    .toFile(path.join(__dirname, '../public/favicon.png'));

  // 生成 Apple Touch Icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .toFormat('png')
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

  // 生成其他尺寸的图标
  const sizes = [16, 32, 48, 64, 96, 128, 256];
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .toFormat('png')
      .toFile(path.join(__dirname, `../public/icon-${size}x${size}.png`));
  }

  console.log('图标生成完成！');
}

generateIcons().catch(console.error); 