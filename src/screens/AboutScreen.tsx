import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderMenu from '../components/HeaderMenu';
import { COLORS, SPACING, RADIUS } from '../lib/theme';

interface AboutScreenProps {
  navigation: any;
}

const developers = [
  'Rivera Picoy, Diego Armando',
  'Coronel Camones, Anthony Jesús',
  'García Gutiérrez, Jesus Martin',
  'Pérez Páez, Luis Manuel',
  'Coronel Castillo, Enrique Alexis',
];

const techStack = [
  { name: 'Frontend Web', tech: 'Next.js 14', color: '#3B82F6' },
  { name: 'Frontend Móvil', tech: 'React Native', color: '#10B981' },
  { name: 'Backend', tech: 'Node.js + Express', color: '#8B5CF6' },
  { name: 'Base de Datos', tech: 'PostgreSQL', color: '#F97316' },
  { name: 'Autenticación', tech: 'Supabase Auth', color: '#EC4899' },
  { name: 'Cloud', tech: 'Azure', color: '#6366F1' },
];

export default function AboutScreen({ navigation }: AboutScreenProps) {
  const openGitHub = () => {
    Linking.openURL('https://github.com/dariverap');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderMenu 
        title="Acerca de" 
        subtitle="Información del sistema"
        navigation={navigation}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="information-circle" size={48} color={COLORS.primaryEnd} />
          <Text style={styles.title}>ParkingSys</Text>
          <Text style={styles.subtitle}>
            Sistema Inteligente de Gestión de Estacionamientos
          </Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Versión 1.0.0</Text>
          </View>
        </View>

        {/* Sobre el Proyecto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre el Proyecto</Text>
          <Text style={styles.description}>
            ParkingSys es una solución innovadora diseñada para optimizar la gestión de espacios de estacionamiento 
            en tiempo real. Desarrollado con tecnologías modernas, ofrece una experiencia fluida tanto en web como 
            en dispositivos móviles.
          </Text>
          <Text style={styles.description}>
            El sistema permite a los usuarios reservar espacios, gestionar ocupaciones, procesar pagos y generar 
            comprobantes electrónicos de manera automática.
          </Text>
          <Text style={styles.description}>
            Proyecto universitario desarrollado para el curso Integrador II, bajo la guía de la profesora 
            Claudia Yolanda Villalta Flores, aplicando la metodología Scrum.
          </Text>
        </View>

        {/* Equipo de Desarrollo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scrum Team</Text>
          <Text style={styles.teamLabel}>Grupo: Los Galácticos</Text>
          {developers.map((dev, index) => {
            const initial = dev.split(',')[0].charAt(0);
            return (
              <View key={index} style={styles.developerItem}>
                <View style={styles.developerAvatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <Text style={styles.developerName}>{dev}</Text>
              </View>
            );
          })}
        </View>

        {/* Tecnologías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tecnologías Utilizadas</Text>
          <View style={styles.techGrid}>
            {techStack.map((item, index) => (
              <View
                key={index}
                style={[styles.techCard, { backgroundColor: item.color + '15' }]}
              >
                <Text style={[styles.techName, { color: item.color }]}>
                  {item.name}
                </Text>
                <Text style={[styles.techDetail, { color: item.color }]}>
                  {item.tech}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* GitHub */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Código Fuente</Text>
          <View style={styles.githubCard}>
            <Icon name="logo-github" size={40} color="#FFF" style={styles.githubIcon} />
            <View style={styles.githubContent}>
              <Text style={styles.githubTitle}>Repositorio del Proyecto</Text>
              <Text style={styles.githubDescription}>
                Código fuente disponible en GitHub. Mantenido por Diego Rivera.
              </Text>
              <TouchableOpacity style={styles.githubButton} onPress={openGitHub}>
                <Icon name="logo-github" size={20} color="#1F2937" />
                <Text style={styles.githubButtonText}>Ver en GitHub</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 ParkingSys - Todos los derechos reservados
          </Text>
          <Text style={styles.footerText}>
            Desarrollado con ❤️ por Los Galácticos
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMid,
    textAlign: 'center',
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: COLORS.primaryEnd,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  versionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMid,
    marginBottom: 8,
  },
  professorName: {
    fontWeight: '700',
    color: COLORS.textDark,
  },
  teamLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryEnd,
    marginBottom: 12,
  },
  developerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  developerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryEnd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  developerName: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
    flex: 1,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  techName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  techDetail: {
    fontSize: 11,
    textAlign: 'center',
  },
  githubCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  githubIcon: {
    marginRight: 12,
  },
  githubContent: {
    flex: 1,
  },
  githubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  githubDescription: {
    fontSize: 13,
    color: '#D1D5DB',
    marginBottom: 12,
    lineHeight: 18,
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  githubButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
});
