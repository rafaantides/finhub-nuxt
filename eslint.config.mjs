// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/no-multiple-template-root': 'off',
    'vue/max-attributes-per-line': ['error', { singleline: 3 }],
    '@stylistic/quote-props': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@stylistic/arrow-parens': ['error', 'always'],
    '@stylistic/operator-linebreak': 'off',
    '@stylistic/member-delimiter-style': 'off'
  }
})
