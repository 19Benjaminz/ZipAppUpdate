// plugins/withBraintree.js
const { withPodfile, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withBraintree(config) {
  // 1. Add Braintree pods
  config = withPodfile(config, (config) => {
    let contents = config.modResults.contents;
    const pods = `
  pod 'Braintree'
  pod 'Braintree/PayPal'
  pod 'BraintreeDropIn'
`;
    contents = contents.replace(/(use_expo_modules!\s*\n)/, `$1${pods}`);
    config.modResults.contents = contents;
    return config;
  });

  // 2. Copy PaymentManager files to ios/ZipcodeXpress (this is enough!)
  config = withDangerousMod(config, [
    'ios',
    (config) => {
      const src = path.join(config.modRequest.projectRoot, 'native/ios/PaymentManager');
      const dest = path.join(config.modRequest.platformProjectRoot, 'ZipcodeXpress');

      if (fs.existsSync(src)) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach((file) => {
          fs.copyFileSync(path.join(src, file), path.join(dest, file));
          console.log(`Copied ${file} → ios/ZipcodeXpress/${file}`);
        });
      }
      return config;
    },
  ]);

  // 3. Silence ALL Braintree warnings (Xcode 16 fix)
  config = withPodfile(config, (config) => {
    let contents = config.modResults.contents;
    if (!contents.includes('GCC_WARN_INHIBIT_ALL_WARNINGS')) {
      const fix = `
  # Fix Braintree build errors in Xcode 16
  installer.pods_project.targets.each do |target|
    if target.name.include?('Braintree')
      target.build_configurations.each do |config|
        config.build_settings['CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS'] = 'NO'
        config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
      end
    end
  end
`;
      contents = contents.replace(
        /(post_install do \|[^|]*\|\s*\n)/,
        `$1${fix}\n  `
      );
    }
    config.modResults.contents = contents;
    return config;
  });

  return config;
};