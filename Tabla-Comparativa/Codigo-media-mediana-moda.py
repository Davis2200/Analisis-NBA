import pandas as pd
import os

# Ruta completa a tu archivo CSV
ruta_archivo = r"c:\Users\dnava\OneDrive\Documentos\Uni David\Organizador\Analisis-NBA\Tabla-Comparativa\Tabla comparativa.csv"

# Asegúrate de que la ruta sea correcta y que el archivo exista
if os.path.exists(ruta_archivo):
    # Cargar el archivo CSV en un DataFrame
    Tabla_comparativa = pd.read_csv(ruta_archivo)
    # pd.set_option('display.max_columns', None)
    # print(df)  # Muestra las primeras 5 filas
else:
    print(f"El archivo no existe en la ruta: {ruta_archivo}")
    # Lista los archivos en el directorio para ver qué hay disponible
    directorio = os.path.dirname(ruta_archivo)
    if os.path.exists(directorio):
        print(f"Archivos disponibles en el directorio: {os.listdir(directorio)}")
        
        


Tabla_comparativa.columns.str.strip()  # Elimina espacios al inicio y final de los nombres de las columnas

Tabla_comparativa = Tabla_comparativa.dropna(subset=['Equipo ganador', 'equipo perdedor'])
#print(df.columns)       
Columnas_importantes = Tabla_comparativa[['Puntaje de equipo ganador', 'Puntaje de equipo perdedor', 'Diferencia']]

#print(Columnas_importantes.columns)

# Calcular la media
promedioperdedor = Columnas_importantes['Puntaje de equipo perdedor'].mean()

# Calcular la mediana
medianaperdedor = Columnas_importantes['Puntaje de equipo perdedor'].median()

# Calcular la moda
modaperdedor = Columnas_importantes['Puntaje de equipo perdedor'].mode().values[0]

#Calculamos las medidas de tendencia central 
# Calcular la media
promedio = Columnas_importantes['Puntaje de equipo ganador'].mean()

# Calcular la mediana
mediana = Columnas_importantes['Puntaje de equipo ganador'].median()

# Calcular la moda
moda = Columnas_importantes['Puntaje de equipo ganador'].mode().values[0]

# Filtrar los equipos con la moda ganadora
equipos_moda_ganadora = Tabla_comparativa[Tabla_comparativa['Puntaje de equipo ganador'] == moda]['Equipo ganador'].unique()

# Filtrar los equipos con la moda perdedora
equipos_moda_perdedora = Tabla_comparativa[Tabla_comparativa['Puntaje de equipo perdedor'] == modaperdedor]['equipo perdedor'].unique()

#df.columns = df.columns.str.strip()  # Elimina espacios al inicio y final de los nombres de las columnas

# Mostrar los resultados



#print(df.columns)





# Normalizar los nombres de los equipos
Tabla_comparativa['Equipo ganador'] = Tabla_comparativa['Equipo ganador'].str.strip().str.title()
Tabla_comparativa['equipo perdedor'] = Tabla_comparativa['equipo perdedor'].str.strip().str.title()

# Verificar duplicados en el DataFrame
print("Filas duplicadas en Tabla_comparativa:")
print(Tabla_comparativa[Tabla_comparativa.duplicated()])

# Verificar valores únicos en la columna 'Equipo ganador'
print("Valores únicos en 'Equipo ganador':")
print(Tabla_comparativa['Equipo ganador'].unique())

# Verificar el conteo manual de juegos ganados
print("Conteo manual de juegos ganados:")
print(Tabla_comparativa['Equipo ganador'].value_counts())

# Eliminar filas duplicadas (si es necesario)
Tabla_comparativa = Tabla_comparativa.drop_duplicates()

# Contar juegos ganados
juegos_ganados = Tabla_comparativa['Equipo ganador'].value_counts().reset_index()
juegos_ganados.columns = ['Equipo', 'Juegos Ganados']

# Contar juegos perdidos
juegos_perdidos = Tabla_comparativa['equipo perdedor'].value_counts().reset_index()
juegos_perdidos.columns = ['Equipo', 'Juegos Perdidos']

# Verificar los conteos
print("Juegos ganados:")
print(juegos_ganados)

print("Juegos perdidos:")
print(juegos_perdidos)

# Obtener todos los equipos únicos (ganadores y perdedores)
equipos_unicos = pd.concat([
    Tabla_comparativa['Equipo ganador'],
    Tabla_comparativa['equipo perdedor']
]).unique()

# Crear un DataFrame con todos los equipos
todos_los_equipos = pd.DataFrame({'Equipo': equipos_unicos})

# Unir los conteos con el DataFrame de todos los equipos
todos_los_equipos = todos_los_equipos.merge(juegos_ganados, on='Equipo', how='left')
todos_los_equipos = todos_los_equipos.merge(juegos_perdidos, on='Equipo', how='left')

# Reemplazar NaN por 0 en las columnas de juegos ganados y perdidos
todos_los_equipos['Juegos Ganados'] = todos_los_equipos['Juegos Ganados'].fillna(0).astype(int)
todos_los_equipos['Juegos Perdidos'] = todos_los_equipos['Juegos Perdidos'].fillna(0).astype(int)

# Calcular el puntaje total de los equipos ganadores
puntaje_total_por_equipo = Tabla_comparativa.groupby('Equipo ganador')['Puntaje de equipo ganador'].sum().reset_index()
puntaje_total_por_equipo.columns = ['Equipo', 'Puntaje Total']

# Calcular el puntaje total de los equipos perdedores
puntaje_total_por_equipo_perdedor = Tabla_comparativa.groupby('equipo perdedor')['Puntaje de equipo perdedor'].sum().reset_index()
puntaje_total_por_equipo_perdedor.columns = ['Equipo', 'Puntaje Total Perdedor']


# Unir los puntajes totales con el DataFrame de todos los equipos
todos_los_equipos = todos_los_equipos.merge(puntaje_total_por_equipo, on='Equipo', how='left')
todos_los_equipos = todos_los_equipos.merge(puntaje_total_por_equipo_perdedor, on='Equipo', how='left')

# Reemplazar NaN por 0 en las columnas de puntajes
todos_los_equipos['Puntaje Total'] = todos_los_equipos['Puntaje Total'].fillna(0).astype(int)
todos_los_equipos['Puntaje Total Perdedor'] = todos_los_equipos['Puntaje Total Perdedor'].fillna(0).astype(int)

# Agregar columna 'Intervalo'
todos_los_equipos['Intervalo'] = '24/02-02/03'


# Calcular el total de juegos para cada equipo
todos_los_equipos['Total de Juegos'] = todos_los_equipos['Juegos Ganados'] + todos_los_equipos['Juegos Perdidos']

todos_los_equipos = todos_los_equipos.sort_values(by='Juegos Ganados', ascending=False).sort_values(by='Puntaje Total', ascending=False)

# Mostrar el DataFrame final
print(todos_los_equipos)


print ('Media {} , moda {} , mediana {} de los equipos ganadores'.format(promedio, moda, mediana), end=' ')
print("Equipos con la moda ganadora:", equipos_moda_ganadora)
print ('Media {} , moda {} , mediana {} de los equipos perdedores'.format(promedioperdedor, modaperdedor, medianaperdedor), end=' ')
print("Equipos con la moda perdedora:", equipos_moda_perdedora)
