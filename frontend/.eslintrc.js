module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Permitir console.log en desarrollo, advertir en producción
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // Otras reglas útiles
    'no-unused-vars': ['warn', { 
      'vars': 'all', 
      'args': 'after-used', 
      'ignoreRestSiblings': false 
    }],
    'no-use-before-define': ['error', { 
      'functions': false, 
      'classes': true, 
      'variables': true 
    }]
  },
  ignorePatterns: [
    'node_modules/',
    'build/',
    'public/',
    '*.min.js'
  ]
};