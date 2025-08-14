import pandas as pd
from sqlalchemy import create_engine
import os

# Configuración de PostgreSQL
DB_CONFIG = {
    'user': 'aadmin',
    'password': 'contrasenasegura123!',
    'host': 'localhost',
    'port': '5432',
    'database': 'nba_stats'
}

def csv_to_postgres(csv_file, table_name):
    """
    Carga un archivo CSV directamente a una tabla PostgreSQL
    :param csv_file: Ruta del archivo CSV
    :param table_name: Nombre de la tabla destino
    """
    try:
        # 1. Verificar que el archivo existe
        if not os.path.exists(csv_file):
            print(f"❌ Error: El archivo {csv_file} no existe")
            return False
        
        print(f"\nLeyendo archivo CSV: {csv_file}")
        
        # 2. Leer el CSV con pandas
        df = pd.read_csv(csv_file)
        
        if df.empty:
            print("❌ El archivo CSV está vacío")
            return False
        
        print(f"✅ CSV leído correctamente. Registros encontrados: {len(df)}")
        print("\nMuestra de los datos:")
        print(df.head(3))
        
        # 3. Conectar a PostgreSQL
        engine = create_engine(
            f"postgresql+psycopg2://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
            f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        )
        
        # 4. Insertar datos en PostgreSQL
        print(f"\nCargando datos en la tabla '{table_name}'...")
        
        df.to_sql(
            name=table_name,
            con=engine,
            if_exists='append',  # Añade a los datos existentes
            index=False,         # No incluir el índice
            method='multi',      # Inserta múltiples filas a la vez
            chunksize=1000       # Inserta en lotes de 1000 registros
        )
        
        print(f"✅ ¡Datos cargados con éxito! {len(df)} registros insertados")
        return True
        
    except Exception as e:
        print(f"\n❌ Error durante la carga: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== CARGA DE CSV A POSTGRESQL ===")
    
    # Configuración (cambia estos valores)
    ARCHIVO_CSV = "nba_players_adapted.csv"  # Nombre de tu archivo CSV
    TABLA_DESTINO = "players"      # Nombre de la tabla en PostgreSQL
    
    if csv_to_postgres(ARCHIVO_CSV, TABLA_DESTINO):
        print("\n🎉 Proceso completado exitosamente!")
    else:
        print("\n⚠️ Ocurrieron problemas durante la carga")