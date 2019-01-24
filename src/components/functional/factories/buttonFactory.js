import { get } from 'lodash'

const options = ctx => {
  const [ctrlName, def] = ctx.control
  const model = ctx.model
  return {
    attrs: {
      id: ctrlName,
      'data-id': ctrlName,
      class: ctx.themes[ctx.theme][def.type] || ''
    },
    domProps: {
      value: def.model ? get(model, def.model) : '',
      type: def.inputType || ''
    },
    on: {
      click: function(event) {
        ctx.$emit('click', event, {
          ctrlName,
          binding: def.action
        })
        if (def.inputType === 'submit') {
          ctx.$emit('submit', event, {
            ctrlName,
            binding: def.action,
            model // send current state of the model
          })
        }
      }
    }
  }
}

const make = (ctx, h) => {
  const [, def] = ctx.control
  return h('button', options(ctx), def.text)
}

export default make
