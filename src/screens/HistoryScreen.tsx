// screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, RADIUS } from '../lib/theme';
import HeaderMenu from '../components/HeaderMenu';
import { getHistorialUsuario, HistorialOperacion } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function HistoryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [historial, setHistorial] = useState<HistorialOperacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<HistorialOperacion | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    console.log('[HistoryScreen] useEffect - Usuario:', user);
    loadHistorial();
  }, [user]);

  const loadHistorial = async () => {
    console.log('[HistoryScreen] loadHistorial iniciado');
    console.log('[HistoryScreen] user:', user);
    
    // El user puede tener 'id' o 'id_usuario' dependiendo del endpoint
    const userId = user?.id_usuario || user?.id;
    console.log('[HistoryScreen] userId:', userId);
    
    if (!userId) {
      console.warn('[HistoryScreen] No hay userId, abortando carga');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('[HistoryScreen] Llamando getHistorialUsuario con id:', userId);
      const data = await getHistorialUsuario(userId, { limit: 100 });
      console.log('[HistoryScreen] Historial recibido:', data?.length, 'items');
      setHistorial(data);
    } catch (error: any) {
      console.error('[HistoryScreen] Error al cargar historial:', error);
      console.error('[HistoryScreen] Error response:', error.response?.data);
      console.error('[HistoryScreen] Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistorial();
    setRefreshing(false);
  };

  const openDetail = (item: HistorialOperacion) => {
    setSelectedOperation(item);
    setDetailModalVisible(true);
  };

  const closeDetail = () => {
    setDetailModalVisible(false);
    setSelectedOperation(null);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'finalizada_pagada':
        return COLORS.success;
      case 'finalizada':
        return COLORS.warning;
      case 'activa':
      case 'confirmada':
        return COLORS.info;
      case 'cancelada':
      case 'expirada':
        return COLORS.error;
      default:
        return COLORS.textMid;
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'finalizada_pagada':
        return 'Pagada';
      case 'finalizada':
        return 'Finalizada';
      case 'activa':
        return 'Activa';
      case 'confirmada':
        return 'Confirmada';
      case 'cancelada':
        return 'Cancelada';
      case 'expirada':
        return 'Expirada';
      default:
        return estado;
    }
  };

  const getMetodoIcon = (metodo_tipo: string | null) => {
    switch (metodo_tipo) {
      case 'efectivo':
        return 'cash-outline';
      case 'qr':
        return 'qr-code-outline';
      case 'tarjeta':
        return 'card-outline';
      default:
        return 'wallet-outline';
    }
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return 'N/A';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatHora = (fecha: string | null) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuracion = (minutos: number | null) => {
    if (!minutos) return 'N/A';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderItem = ({ item }: { item: HistorialOperacion }) => {
    // Fecha base: pago > salida > entrada > programada > creada
    const fechaBase = item.fechas.pago_at || item.fechas.salida_at || item.fechas.entrada_at || item.fechas.hora_programada_inicio || item.fechas.creada_at;
    
    return (
      <TouchableOpacity
        style={styles.operationCard}
        onPress={() => openDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.operationHeader}>
          <View style={styles.operationTipo}>
            <Icon 
              name={item.tipo === 'reserva' ? 'calendar' : 'car'} 
              size={20} 
              color={COLORS.primaryEnd} 
            />
            <Text style={styles.operationTipoText}>
              {item.tipo === 'reserva' ? 'Reserva' : 'Walk-in'}
            </Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado_final) }]}>
            <Text style={styles.estadoText}>{getEstadoLabel(item.estado_final)}</Text>
          </View>
        </View>

        <View style={styles.operationBody}>
          <View style={styles.infoRow}>
            <Icon name="location-outline" size={16} color={COLORS.textMid} />
            <Text style={styles.infoText} numberOfLines={1}>
              Espacio {item.espacio?.numero_espacio || 'N/A'}
            </Text>
          </View>

          {item.vehiculo && (
            <View style={styles.infoRow}>
              <Icon name="car-outline" size={16} color={COLORS.textMid} />
              <Text style={styles.infoText}>
                {item.vehiculo.placa} {item.vehiculo.marca ? `• ${item.vehiculo.marca}` : ''}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={16} color={COLORS.textMid} />
            <Text style={styles.infoText}>
              {formatFecha(fechaBase)} {formatHora(fechaBase)}
            </Text>
          </View>

          {item.duracion_minutos && (
            <View style={styles.infoRow}>
              <Icon name="time-outline" size={16} color={COLORS.textMid} />
              <Text style={styles.infoText}>Duración: {formatDuracion(item.duracion_minutos)}</Text>
            </View>
          )}

          {item.pago && (
            <View style={styles.pagoRow}>
              <Icon 
                name={getMetodoIcon(item.pago.metodo_tipo)} 
                size={18} 
                color={COLORS.success} 
              />
              <Text style={styles.montoText}>S/ {item.pago.monto.toFixed(2)}</Text>
              {item.pago.metodo && (
                <Text style={styles.metodoText}> • {item.pago.metodo}</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderMenu 
        title="Historial" 
        subtitle="Todas tus operaciones"
        navigation={navigation}
      />

      {loading && !(user?.id_usuario || user?.id) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryEnd} />
          <Text style={styles.loadingText}>Cargando información del usuario...</Text>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryEnd} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : historial.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="receipt-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Sin operaciones</Text>
          <Text style={styles.emptySubtitle}>
            Aún no tienes reservas u operaciones registradas
          </Text>
        </View>
      ) : (
        <FlatList
          data={historial}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_operacion}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primaryEnd}
              colors={[COLORS.primaryEnd]}
            />
          }
        />
      )}

      {/* Modal de detalle */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de Operación</Text>
              <TouchableOpacity onPress={closeDetail} style={styles.closeButton}>
                <Icon name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedOperation && (
                <>
                  {/* Estado */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Estado</Text>
                    <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(selectedOperation.estado_final) }]}>
                      <Text style={styles.estadoText}>{getEstadoLabel(selectedOperation.estado_final)}</Text>
                    </View>
                  </View>

                  {/* Tipo */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Tipo</Text>
                    <Text style={styles.detailValue}>
                      {selectedOperation.tipo === 'reserva' ? 'Reserva' : 'Walk-in'}
                    </Text>
                  </View>

                  {/* Espacio */}
                  {selectedOperation.espacio && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Espacio</Text>
                      <Text style={styles.detailValue}>
                        {selectedOperation.espacio.numero_espacio}
                      </Text>
                    </View>
                  )}

                  {/* Vehículo */}
                  {selectedOperation.vehiculo && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Vehículo</Text>
                      <Text style={styles.detailValue}>
                        {selectedOperation.vehiculo.placa}
                        {selectedOperation.vehiculo.marca && ` • ${selectedOperation.vehiculo.marca}`}
                        {selectedOperation.vehiculo.modelo && ` ${selectedOperation.vehiculo.modelo}`}
                        {selectedOperation.vehiculo.color && ` (${selectedOperation.vehiculo.color})`}
                      </Text>
                    </View>
                  )}

                  {/* Fechas */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Fechas</Text>
                    {selectedOperation.fechas.creada_at && (
                      <Text style={styles.detailValue}>
                        Creada: {formatFecha(selectedOperation.fechas.creada_at)} {formatHora(selectedOperation.fechas.creada_at)}
                      </Text>
                    )}
                    {selectedOperation.fechas.entrada_at && (
                      <Text style={styles.detailValue}>
                        Entrada: {formatFecha(selectedOperation.fechas.entrada_at)} {formatHora(selectedOperation.fechas.entrada_at)}
                      </Text>
                    )}
                    {selectedOperation.fechas.salida_at && (
                      <Text style={styles.detailValue}>
                        Salida: {formatFecha(selectedOperation.fechas.salida_at)} {formatHora(selectedOperation.fechas.salida_at)}
                      </Text>
                    )}
                  </View>

                  {/* Duración */}
                  {selectedOperation.duracion_minutos && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Duración</Text>
                      <Text style={styles.detailValue}>{formatDuracion(selectedOperation.duracion_minutos)}</Text>
                    </View>
                  )}

                  {/* Pago */}
                  {selectedOperation.pago && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Pago</Text>
                      <Text style={styles.detailValueBold}>S/ {selectedOperation.pago.monto.toFixed(2)}</Text>
                      {selectedOperation.pago.metodo && (
                        <Text style={styles.detailValue}>Método: {selectedOperation.pago.metodo}</Text>
                      )}
                      {selectedOperation.pago.comprobante.tipo && (
                        <Text style={styles.detailValue}>
                          Comprobante: {selectedOperation.pago.comprobante.tipo}
                          {selectedOperation.pago.comprobante.serie && ` ${selectedOperation.pago.comprobante.serie}`}
                          {selectedOperation.pago.comprobante.numero && `-${selectedOperation.pago.comprobante.numero}`}
                        </Text>
                      )}
                      {selectedOperation.pago.comprobante.emitido_en && (
                        <Text style={styles.detailValue}>
                          Emitido: {formatFecha(selectedOperation.pago.comprobante.emitido_en)} {formatHora(selectedOperation.pago.comprobante.emitido_en)}
                        </Text>
                      )}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textMid,
  },
  loadingSubtext: {
    marginTop: SPACING.xs,
    fontSize: 12,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMid,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  listContent: {
    padding: SPACING.md,
  },
  operationCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  operationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  operationTipo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  operationTipoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: SPACING.xs,
  },
  estadoBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  operationBody: {
    gap: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textMid,
    flex: 1,
  },
  pagoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  montoText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
    marginLeft: SPACING.xs,
  },
  metodoText: {
    fontSize: 12,
    color: COLORS.textMid,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  detailSection: {
    marginBottom: SPACING.lg,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMid,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  detailValueBold: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
});
