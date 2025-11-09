module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: false, // Cambiado a false para detectar variables no cargadas
        verbose: true, // Cambiado a true para ver logs de carga
      },
    ],
  ],
};
