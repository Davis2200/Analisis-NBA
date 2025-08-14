import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
import os

# Configuración de la conexión
DB_CONFIG = {
    'user': 'aadmin',
    'password': 'contrasenasegura123!',
    'host': 'localhost',
    'port': '5432',
    'database': 'nba_stats'
}


# Configuración de rutas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Ruta del directorio actual
DATA_DIR = os.path.join(BASE_DIR, 'informacion')      # Ruta a la carpeta de datos

# Archivos CSV a procesar (sin rutas completas)
csv_files = [
    'nba_games_adapted.csv',
    'nba_players_adapted.csv',
    'nba_player_stats_adapted.csv'
]

# Mapeo de tablas (ajusta según tu esquema de BD)
TABLE_NAMES = {
    'nba_games_adapted.csv': 'games',
    'nba_players_adapted.csv': 'players',
    'nba_player_stats_adapted.csv': 'player_statistics'
}

def insert_csv_to_postgres():
    try:
        # Crear engine de SQLAlchemy
        engine = create_engine(
            f"postgresql+psycopg2://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
            f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        )
        
        for csv_file in csv_files:
            try:
                # Construir ruta completa al archivo
                file_path = os.path.join(DATA_DIR, csv_file)
                
                print(f"\nProcesando {csv_file}...")
                
                # Leer CSV
                df = pd.read_csv(file_path)
                
                # Insertar en PostgreSQL
                df.to_sql(
                    name=TABLE_NAMES[csv_file],
                    con=engine,
                    if_exists='append',
                    index=False,
                    method='multi'
                )
                
                print(f"✅ {len(df)} registros insertados en {TABLE_NAMES[csv_file]}")
                
            except FileNotFoundError:
                print(f"❌ Archivo no encontrado: {file_path}")
            except Exception as e:
                print(f"❌ Error procesando {csv_file}: {str(e)}")
                continue
        
        print("\nProceso completado!")
        
    except SQLAlchemyError as e:
        print(f"❌ Error de base de datos: {e}")
    finally:
        if 'engine' in locals():
            engine.dispose()

if __name__ == "__main__":
    insert_csv_to_postgres()