import vine from '@vinejs/vine'

const onlyLettersAndSpaces = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100).regex(onlyLettersAndSpaces),
    email: vine.string().trim().email(),
    password: vine.string().minLength(6).maxLength(50)
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(1)
  })
)
