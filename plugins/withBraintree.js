// plugins/withBraintree.js
const { withPodfile, withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withBraintree(config) {
  // 1. Add Braintree pods (iOS)
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

  // 2. Copy PaymentManager files to iOS project
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

  // 3. Silence Braintree warnings (Xcode 16 fix)
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

  // 4. Add Android intent-filter for Braintree return scheme (fixes the deep link error)
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    const packageName = config.android?.package;

    if (!packageName) {
      console.warn('No android.package found in config – skipping Braintree Android manifest changes');
      return config;
    }

    const braintreeScheme = `${packageName}.braintree`;

    // Find the MainActivity (Expo's default launcher activity)
    const mainApplication = androidManifest.application[0];
    const mainActivity = mainApplication.activity?.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (!mainActivity) {
      console.warn('MainActivity not found in AndroidManifest.xml');
      return config;
    }

    // Ensure intent-filter array exists
    mainActivity['intent-filter'] = mainActivity['intent-filter'] || [];

    // Check if the Braintree intent-filter already exists to avoid duplicates
    const alreadyHasBraintreeFilter = mainActivity['intent-filter'].some((filter) => {
      return filter.data?.some((d) => d.$['android:scheme'] === braintreeScheme);
    });

    if (alreadyHasBraintreeFilter) {
      console.log('Braintree intent-filter already exists – skipping');
      return config;
    }

    // Add the required intent-filter for Braintree redirects
    mainActivity['intent-filter'].push({
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      category: [
        { $: { 'android:name': 'android.intent.category.DEFAULT' } },
        { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
      ],
      data: [{ $: { 'android:scheme': braintreeScheme } }],
    });

    // Ensure exported is true (required for Android 12+ when using intent-filters)
    mainActivity.$['android:exported'] = 'true';

    console.log(`Added Braintree intent-filter with scheme: ${braintreeScheme}`);
    return config;
  });

  return config;
};