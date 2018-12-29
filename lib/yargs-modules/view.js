import mkCmd from '../utils/cmd-handler.js'
import commonOpts from '../common-opts.js'

export const command = 'view [<pkg>[@<version>]] [<field>...]'
export const aliases = ['v', 'info', 'show']
export const describe = 'Show information about a package'
export const options = Object.assign(commonOpts, {})
export const builder = (yargs) => {
  return yargs.help().alias('help', 'h').options(options)
}
export const handler = mkCmd((...args) => {
  // TODO - Not using dynamic import here because it breaks linter.
  const cmd = require('../commands/view.js')
  return cmd.default(...args)
})
