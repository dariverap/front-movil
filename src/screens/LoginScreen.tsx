// screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconInput from '../components/IconInput';
import ButtonGradient from '../components/ButtonGradient';
import { COLORS, SPACING, RADIUS } from '../lib/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'El formato del correo electrónico no es válido');
      return;
    }

    try {
      setLoading(true);
      await login({ email: email.trim(), password });
      
      // El login exitoso redirigirá automáticamente por el AuthProvider
      navigation.replace('Home');
    } catch (error: any) {
      Alert.alert(
        'Error al iniciar sesión',
        error.message || 'Credenciales inválidas. Por favor verifica tu correo y contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.top}>
            <View style={styles.logoWrap}>
              <Icon name="car" size={48} color={COLORS.primaryEnd} />
            </View>
            <Text style={styles.title}>Bienvenido a Parking</Text>
            <Text style={styles.subtitle}>Reserva estacionamientos cerca de ti en segundos.</Text>
          </View>

          <View style={styles.form}>
            <IconInput 
              icon="mail-outline" 
              placeholder="Correo electrónico" 
              value={email} 
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            <IconInput 
              icon="lock-closed-outline" 
              placeholder="Contraseña" 
              value={password} 
              onChangeText={setPassword} 
              style={{ marginTop: SPACING.sm }} 
              secureTextEntry
              editable={!loading}
            />

            <ButtonGradient
              title={loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            />

            {loading && (
              <ActivityIndicator 
                size="small" 
                color={COLORS.primaryEnd} 
                style={{ marginTop: SPACING.sm }}
              />
            )}

            <View style={styles.rowLinks}>
              <ButtonGradient
                title="Registrarse"
                variant="outline"
                onPress={handleRegister}
                style={styles.actionButton}
                disabled={loading}
              />

              <ButtonGradient
                title="Recuperar contraseña"
                variant="ghost"
                onPress={handleForgotPassword}
                style={styles.actionButton}
                disabled={loading}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1, paddingHorizontal: SPACING.lg, justifyContent: 'center' },
  top: { alignItems: 'center', marginBottom: SPACING.lg },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  logo: { width: 88, height: 88, borderRadius: 14 },
  title: { fontSize: 26, color: COLORS.textDark, fontWeight: '800', marginTop: SPACING.md },
  subtitle: { color: COLORS.textMid, textAlign: 'center', marginTop: SPACING.sm, maxWidth: 300 },
  form: { marginTop: SPACING.lg },
  loginButton: { marginTop: SPACING.lg, borderRadius: RADIUS.large },
  rowLinks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md },
  actionButton: { flex: 1, marginHorizontal: SPACING.xs },
});