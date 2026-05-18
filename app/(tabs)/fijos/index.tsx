import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTourGuideController } from "rn-tourguide";

import { CircleButton, HeaderComponent } from '@/components';
import { colors } from '@/styles/constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getServiciosMensualesServices } from '@/api/services/servicios_mensuales/get.serviciosMensuales.service';
import { updateServiciosMensualesServices } from '@/api/services/servicios_mensuales/update.serviciosMensuales.service';
import { postServiciosMensualesServices } from '@/api/services/servicios_mensuales/post.serviciosMensuales.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useMonthlyReset } from '@/hooks';

enum EstadosEnum {
  Pendiente = 'Pendiente',
  Pagado = 'Pagado'
}

interface GastoFijo {
  id: string | number;
  name: string;
  estado: EstadosEnum;
  fecha_actualizacion?: string | null;
}

const GastosFijosScreen = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');

  const { data: gastos = [], isLoading, error, refetch, isRefetching } = useQuery<GastoFijo[]>({
    queryKey: ['servicios_mensuales'],
    queryFn: () => getServiciosMensualesServices(),
  });

  // Hook para detectar inicio de mes y reiniciar los servicios mensuales
  const { isResetting } = useMonthlyReset(refetch);

  const mutation = useMutation({
    mutationFn: ({ id, nuevoEstado, fechaActualizacion }: { id: string | number; nuevoEstado: EstadosEnum; fechaActualizacion: string | null }) =>
      updateServiciosMensualesServices(id, nuevoEstado, fechaActualizacion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios_mensuales'] });
    },
    onError: (err) => {
      console.error("Error al actualizar estado:", err);
      Alert.alert("Error", "No se pudo actualizar el estado del servicio.");
    }
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => postServiciosMensualesServices(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios_mensuales'] });
      setModalVisible(false);
      setNewServiceName('');
      Alert.alert("Éxito", "El servicio ha sido creado correctamente.");
    },
    onError: (err) => {
      console.error("Error al crear servicio:", err);
      Alert.alert("Error", "No se pudo crear el servicio mensual.");
    }
  });

  // Inicializar controlador del tour interactivo
  const { start, canStart, TourGuideZone, eventEmitter } = useTourGuideController('fijos');

  // Ejecutar tour automáticamente en el primer inicio de sesión
  useEffect(() => {
    const checkAndStartTour = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('has_seen_tour_fijos');
        if (!hasSeen && canStart) {
          setTimeout(() => {
            start();
          }, 800);
        }
      } catch (err) {
        console.error("Error al comprobar estado del tour fijos:", err);
      }
    };
    checkAndStartTour();
  }, [canStart]);

  // Guardar estado cuando el tour finaliza o se omite
  useEffect(() => {
    if (!eventEmitter) return;

    const handleTourStop = async () => {
      try {
        await AsyncStorage.setItem('has_seen_tour_fijos', 'true');
      } catch (err) {
        console.error("Error al guardar estado del tour fijos:", err);
      }
    };

    eventEmitter.on('stop', handleTourStop);

    return () => {
      eventEmitter.off('stop', handleTourStop);
    };
  }, [eventEmitter]);

  // Forzar inicio manual del tour
  const handleForceTourStart = () => {
    start();
  };

  const handleCreateService = () => {
    if (!newServiceName.trim()) {
      Alert.alert("Error", "Por favor ingresa un nombre para el servicio.");
      return;
    }
    createMutation.mutate(newServiceName.trim());
  };

  const handleToggleEstado = (item: GastoFijo) => {
    const nuevoEstado: EstadosEnum = item.estado === 'Pagado' ? EstadosEnum.Pendiente : EstadosEnum.Pagado;

    if (item.estado === EstadosEnum.Pendiente) {
      Alert.alert(
        "Confirmar Pago",
        "¿Ya realizaste el pago correspondiente a este mes?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Sí, pagar", 
            onPress: () => mutation.mutate({ 
              id: item.id, 
              nuevoEstado, 
              fechaActualizacion: new Date().toISOString().split('T')[0] // Envía fecha YYYY-MM-DD
            }) 
          }
        ]
      );
    } else {
      Alert.alert(
        "Revertir Pago",
        "¿Deseas marcar este servicio como pendiente?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Sí, revertir", 
            onPress: () => mutation.mutate({ 
              id: item.id, 
              nuevoEstado, 
              fechaActualizacion: null // Blanquea la fecha
            }) 
          }
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: GastoFijo }) => (
    <View className="flex-row items-center justify-between bg-white p-4 mx-4 mb-3 rounded-2xl shadow-sm border border-gray-100">
      <Text className="flex-1 text-base font-bold text-gray-800">{item.name}</Text>
      
      {/* Visualizacion del estado del gasto fijo */}
      <View className="flex-1 items-center">
        <View className={`w-24 items-center px-3 py-2 rounded-xl border ${item.estado === EstadosEnum.Pagado ? 'border-green-400 bg-green-100' : 'border-amber-400 bg-amber-100'}`}>
          <Text className={`text-xs font-bold ${item.estado === EstadosEnum.Pagado ? 'text-green-700' : 'text-amber-700'}`}>
            {item.estado}
          </Text>
        </View>
      </View>

      {/* Boton de accion */}
      <View className="flex-1 items-end ">
        <Pressable 
          onPress={() => handleToggleEstado(item)}
          disabled={mutation.isPending}
          className={`items-center px-3 py-2 h-10 w-24 rounded-xl border ${item.estado === EstadosEnum.Pagado ? 'border-amber-400 bg-amber-100' : 'bg-primary'}`}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className={`text-xs font-bold ${item.estado === EstadosEnum.Pagado ? 'text-amber-700' : 'text-white'}`}>
              {item.estado === EstadosEnum.Pagado ? 'Listo' : 'Pagar'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );

  // Calcular contadores
  const pendientes = gastos.filter(g => g.estado === EstadosEnum.Pendiente).length;
  const pagados = gastos.filter(g => g.estado === EstadosEnum.Pagado).length;

  return (
    <View className='flex-1 bg-gray-50'>
      {/* Zona 1: Encabezado */}
      <TourGuideZone
        zone={1}
        text="¡Panel de Gastos Fijos! Lleva el control de tus servicios recurrentes (como Netflix, internet, luz) que debes pagar mes a mes."
        shape="rectangle"
      >
        <View style={{ borderRadius: 16, overflow: 'hidden' }}>
          <HeaderComponent
            title='Gastos Fijos por Mes'
            icon={false}
            onPressHelp={handleForceTourStart}
          />
        </View>
      </TourGuideZone>

      {/* Zona 2: Contadores Superiores */}
      <TourGuideZone
        zone={2}
        text="Visualiza cuántos de tus servicios fijos siguen marcados como Pendientes y cuántos ya han sido Pagados en el mes."
        shape="rectangle"
      >
        <View className="flex-row justify-between px-4 mt-2 mb-1">
          <View className="flex-1 bg-amber-100/60 border border-amber-300 p-4 rounded-2xl mx-1 shadow-sm items-center">
            <Text className="text-sm font-bold text-amber-800">Pendientes</Text>
            <Text className="text-2xl font-bold text-amber-800 mt-1">{pendientes}</Text>
          </View>
          <View className="flex-1 bg-green-100/60 border border-green-300 p-4 rounded-2xl mx-1 shadow-sm items-center">
            <Text className="text-sm font-bold text-green-800">Pagados</Text>
            <Text className="text-2xl font-bold text-green-800 mt-1">{pagados}</Text>
          </View>
        </View>
      </TourGuideZone>

      {/* Zona 3: Listado Principal y Acción de pago */}
      <View className="flex-1 mt-2">
        <TourGuideZone
          zone={3}
          text="Este es tu listado de servicios. Toca el botón 'Pagar' para saldar el servicio o 'Listo' para revertirlo a pendiente."
          shape="rectangle"
        >
          <View className="flex-1">
            {/* Table Header */}
            <View className='flex-row items-center justify-between px-8 py-3 bg-white border-b border-gray-200 mx-4 rounded-t-2xl mb-2 shadow-sm'>
              <Text className='flex-1 text-sm font-bold text-gray-500'>
                Servicio
              </Text>
              <Text className='flex-1 text-sm font-bold text-gray-500 text-center'>
                Estado
              </Text>
              <Text className='flex-1 text-sm font-bold text-gray-500 text-right'>
                Acción
              </Text>
            </View>

            {isLoading || isResetting ? (
              <ActivityIndicator
                size='large'
                color={colors.primary}
                className='mt-10'
              />
            ) : error ? (
              <Text className='text-center text-red-500 mt-10'>
                Error al cargar los servicios fijos.
              </Text>
            ) : (
              <FlatList
                data={gastos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                }
                ListEmptyComponent={
                  <Text className='text-center text-gray-500 mt-10'>
                    No hay gastos fijos configurados
                  </Text>
                }
              />
            )}
          </View>
        </TourGuideZone>
      </View>

      {/* Zona 4: Acción flotante: Crear nuevo gasto */}
      <View className='bottom-0 right-0 m-3 absolute z-50'>
        <TourGuideZone
          zone={4}
          text="Presiona el botón '+' para agregar un nuevo servicio recurrente al listado mensual."
          shape="circle"
        >
          <CircleButton
            text='+'
            onPressFunction={() => setModalVisible(true)}
          />
        </TourGuideZone>
      </View>

      {/* Modal para crear nuevo servicio */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType='fade'
        onRequestClose={() => {
          setModalVisible(false);
          setNewServiceName('');
        }}
      >
        <View className='flex-1 justify-center items-center bg-black/50 px-4'>
          <View className='bg-white p-6 rounded-3xl w-full max-w-sm shadow-lg'>
            <Text className='text-xl font-bold text-gray-800 mb-4 text-center'>
              Nuevo Gasto Fijo
            </Text>
            
            <Text className='text-sm text-gray-500 mb-2'>
              Nombre del Servicio
            </Text>
            
            <TextInput
              className='w-full rounded-xl border border-gray-200 bg-gray-50 h-12 px-4 text-base font-semibold text-gray-800 mb-6'
              placeholder='Ej. Netflix, Internet, Luz'
              value={newServiceName}
              onChangeText={setNewServiceName}
              maxLength={50}
              autoFocus={true}
            />

            <View className='flex-row gap-4 w-full justify-between'>
              <Pressable 
                onPress={() => {
                  setModalVisible(false);
                  setNewServiceName('');
                }}
                className='flex-1 bg-gray-100 py-3 rounded-2xl items-center border border-gray-200'
              >
                <Text className='text-gray-600 font-bold text-sm'>Cancelar</Text>
              </Pressable>
              
              <Pressable 
                onPress={handleCreateService}
                disabled={createMutation.isPending}
                className='flex-1 bg-primary py-3 rounded-2xl items-center flex-row justify-center'
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className='text-white font-bold text-sm'>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GastosFijosScreen;
