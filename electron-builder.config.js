module.exports = {
  appId: 'com.maktabat.app',
  productName: 'Maktabat',
  directories: { output: 'build', buildResources: 'assets' },
  files: ['packages/main/dist/**/*', 'packages/renderer/dist/**/*', 'package.json'],
  mac: {
    target: [{ target: 'dmg', arch: ['x64', 'arm64'] }],
    category: 'public.app-category.education',
    hardenedRuntime: true,
    gatekeeperAssess: false,
  },
  win: { target: ['nsis', 'msi'] },
  linux: { target: ['AppImage', 'deb', 'rpm'], category: 'Education' },
  publish: { provider: 'github', releaseType: 'release' },
}
