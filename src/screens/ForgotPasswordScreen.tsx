import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { forgotPassword } from '../lib/auth';
import IconInput from '../components/IconInput';
import ButtonGradient from '../components/ButtonGradient';
import { COLORS, SPACING } from '../lib/theme';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSendResetLink = async () => {
    // Validación básica
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await forgotPassword(email);
      setSuccess(true);
      setError('');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'No se pudo enviar el correo de recuperación';
      setError(message);
      setSuccess(false);
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
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header con ícono */}
            <View style={styles.header}>
              <View style={styles.logoWrap}>
                <Icon name="car" size={32} color={COLORS.white} />
              </View>
              <Text style={styles.title}>Recuperar Contraseña</Text>
              <Text style={styles.subtitle}>
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
              </Text>
            </View>

            {/* Formulario */}
            <View style={styles.form}>
              <IconInput 
                icon="mail-outline" 
                placeholder="tu@email.com" 
                value={email} 
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                  setSuccess(false);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />

              {/* Mensaje de error */}
              {error && (
                <View style={styles.errorBox}>
                  <Icon name="alert-circle" size={20} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Mensaje de éxito */}
              {success && (
                <View style={styles.successBox}>
                  <Icon name="checkmark-circle" size={20} color="#15803d" />
                  <Text style={styles.successText}>
                    Se ha enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada y spam.
                  </Text>
                </View>
              )}

              {/* Botón enviar */}
              <ButtonGradient
                title={loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                style={styles.sendButton}
                onPress={handleSendResetLink}
                disabled={loading}
              />

              {loading && (
                <ActivityIndicator 
                  size="small" 
                  color={COLORS.primaryEnd} 
                  style={{ marginTop: SPACING.sm }}
                />
              )}

              {/* Botón volver al login */}
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBackToLogin}
                disabled={loading}
              >
                <Icon name="arrow-back" size={18} color={COLORS.primaryEnd} />
                <Text style={styles.backText}>Volver al login</Text>
              </TouchableOpacity>

              {/* Información adicional */}
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>¿No recibes el email?</Text>
                <Text style={styles.infoText}>
                  Revisa tu carpeta de spam o contacta al administrador del sistema para obtener ayuda.
                </Text>
              </View>
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
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl * 2,
    marginBottom: SPACING.xl,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.primaryEnd,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primaryEnd,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#dcfce7',
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successText: {
    color: '#15803d',
    fontSize: 13,
    marginLeft: SPACING.xs,
    flex: 1,
    lineHeight: 18,
  },
  sendButton: {
    marginTop: SPACING.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  backText: {
    color: COLORS.primaryEnd,
    fontSize: 15,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
