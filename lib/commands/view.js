import figgyPudding from 'figgy-pudding'
import libnpm from 'libnpm'
import npmlog from 'npmlog'

import { h, renderToString } from 'ink'
import { PackageView, PackageFields } from '../components/view.jsx'

const ViewOpts = figgyPudding({
  field: {},
  json: {},
  log: { default: () => npmlog },
  'pkg@version': {}
})

export default async function (argv, opts) {
  opts = ViewOpts(opts)

  let { 'pkg@version': spec, field: fields } = opts

  if (!spec) { spec = '.' }
  if (!fields) { fields = [] }

  const packument = await libnpm.packument(spec, opts.concat({
    fullMetadata: true
  }))
  const { rawSpec } = libnpm.parseArg(spec)

  const options = {
    packument,
    fields,
    spec: rawSpec && rawSpec !== '.' ? rawSpec : null,
    json: opts.json
  }

  try {
    const view = h(
      fields.length ? PackageFields : PackageView,
      options
    )
    console.log(renderToString(view))
  } catch (e) {
    opts.log.error('view', e.message)
    opts.log.error('view', e.stack)
  }
}
