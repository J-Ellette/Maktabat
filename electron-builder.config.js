module.exports = {
  appId: 'com.maktabat.app',
  productName: 'Maktabat',
  asar: true,
  compression: 'maximum',
  directories: { output: 'build', buildResources: 'assets' },
  files: ['packages/main/dist/**/*', 'packages/renderer/dist/**/*', 'package.json'],
  mac: {
    target: [{ target: 'dmg', arch: ['universal'] }],
    category: 'public.app-category.education',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    afterSign: 'scripts/notarize.js',
  },
  win: { target: ['nsis', 'msi', 'msix'] },
  linux: { target: ['AppImage', 'deb', 'rpm'], category: 'Education' },
  publish: { provider: 'github', releaseType: 'draft' },
}
