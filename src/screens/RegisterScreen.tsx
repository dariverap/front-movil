// screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconInput from '../components/IconInput';
import ButtonGradient from '../components/ButtonGradient';
import { COLORS, SPACING, RADIUS } from '../lib/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../hooks/useAuth';

export default function RegisterScreen({ navigation }: any) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    if (!apellido.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu apellido');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'El formato del correo electrónico no es válido');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa una contraseña');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Validación opcional de teléfono
    if (telefono && !/^\d{6,15}$/.test(telefono)) {
      Alert.alert('Error', 'El teléfono debe tener entre 6 y 15 dígitos');
      return;
    }

    try {
      setLoading(true);
      
      await register({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password: password,
        telefono: telefono.trim() || undefined,
        rol: 'cliente' // Siempre cliente en app móvil
      });

      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada correctamente. ¡Bienvenido!',
        [
          {
            text: 'Continuar',
            onPress: () => navigation.replace('Home')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error al registrarse',
        error.message || 'No se pudo completar el registro. Por favor intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <View style={styles.logoWrap}>
                <Icon name="person-add" size={40} color={COLORS.primaryEnd} />
              </View>
              <Text style={styles.title}>Crear cuenta</Text>
              <Text style={styles.subtitle}>
                Regístrate como cliente y empieza a reservar estacionamientos
              </Text>
            </View>

            <View style={styles.form}>
              <IconInput 
                icon="person-outline" 
                placeholder="Nombre" 
                value={nombre} 
                onChangeText={setNombre}
                autoCapitalize="words"
                editable={!loading}
              />

              <IconInput 
                icon="person-outline" 
                placeholder="Apellido" 
                value={apellido} 
                onChangeText={setApellido}
                style={{ marginTop: SPACING.sm }}
                autoCapitalize="words"
                editable={!loading}
              />

              <IconInput 
                icon="mail-outline" 
                placeholder="Correo electrónico" 
                value={email} 
                onChangeText={setEmail}
                style={{ marginTop: SPACING.sm }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />

              <IconInput 
                icon="call-outline" 
                placeholder="Teléfono (opcional)" 
                value={telefono} 
                onChangeText={setTelefono}
                style={{ marginTop: SPACING.sm }}
                keyboardType="phone-pad"
                editable={!loading}
              />

              <IconInput 
                icon="lock-closed-outline" 
                placeholder="Contraseña (mínimo 6 caracteres)" 
                value={password} 
                onChangeText={setPassword}
                style={{ marginTop: SPACING.sm }}
                secureTextEntry
                editable={!loading}
              />

              <IconInput 
                icon="lock-closed-outline" 
                placeholder="Confirmar contraseña" 
                value={confirmPassword} 
                onChangeText={setConfirmPassword}
                style={{ marginTop: SPACING.sm }}
                secureTextEntry
                editable={!loading}
              />

              <ButtonGradient
                title={loading ? 'Registrando...' : 'Crear cuenta'}
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}
              />

              {loading && (
                <ActivityIndicator 
                  size="small" 
                  color={COLORS.primaryEnd} 
                  style={{ marginTop: SPACING.sm }}
                />
              )}

              <ButtonGradient
                title="Ya tengo cuenta"
                variant="ghost"
                onPress={handleBackToLogin}
                style={styles.backButton}
                disabled={loading}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  safeArea: { 
    flex: 1, 
    paddingHorizontal: SPACING.lg 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.lg
  },
  header: { 
    alignItems: 'center', 
    marginBottom: SPACING.lg 
  },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  title: { 
    fontSize: 28, 
    color: COLORS.textDark, 
    fontWeight: '800', 
    marginTop: SPACING.md 
  },
  subtitle: { 
    color: COLORS.textMid, 
    textAlign: 'center', 
    marginTop: SPACING.sm, 
    maxWidth: 300,
    lineHeight: 20
  },
  form: { 
    marginTop: SPACING.md 
  },
  registerButton: { 
    marginTop: SPACING.lg, 
    borderRadius: RADIUS.large 
  },
  backButton: { 
    marginTop: SPACING.md 
  },
});
