/* eslint-disable no-param-reassign */
const keystone = require('keystone');
const gm = require('gm');

async function resizeImage(sourcePath, destinationPath, width, height, quality = 80) {
  const { AppError } = keystone.get('errors');

  const img = gm(sourcePath);

  return new Promise((resolve, reject) => {
    img.size((err, size) => {
      if (err) return reject(err);
      if (!size) return reject(new AppError('GraphicMagic cannot retrieve image size'));

      const originalRatio = size.width / size.height;
      const newRatio = width / height;
      if (originalRatio > newRatio) {
        width = null;
      } else {
        height = null;
      }

      return img
        .resize(width, height, '>')
        .quality(quality)
        .noProfile()
        .write(destinationPath, (err2) => {
          if (err) return reject(err2);
          return resolve();
        });
    });
  });
}

module.exports = resizeImage;
