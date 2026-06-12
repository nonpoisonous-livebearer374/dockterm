const path = require('node:path')
const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses')

/**
 * Flips Electron fuses at package time to shrink the runtime attack surface:
 * the packaged binary can no longer be coerced into running as plain Node,
 * honoring NODE_OPTIONS, opening the inspector, or loading app code from outside
 * the asar archive.
 */
exports.default = async function afterPack(context) {
  const { electronPlatformName, appOutDir, packager } = context
  const appName = packager.appInfo.productFilename

  let electronBinary
  if (electronPlatformName === 'darwin') {
    electronBinary = path.join(appOutDir, `${appName}.app`, 'Contents', 'MacOS', appName)
  } else if (electronPlatformName === 'win32') {
    electronBinary = path.join(appOutDir, `${appName}.exe`)
  } else {
    electronBinary = path.join(appOutDir, appName.toLowerCase())
  }

  await flipFuses(electronBinary, {
    version: FuseVersion.V1,
    resetAdHocDarwinSignature: electronPlatformName === 'darwin',
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.OnlyLoadAppFromAsar]: true
  })
}
