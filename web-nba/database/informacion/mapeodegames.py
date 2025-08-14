import pandas as pd
from sqlalchemy import create_engine
import os
from datetime import datetime

# Configuración de conexión a PostgreSQL
DB_CONFIG = {
    'user': 'aadmin',
    'password': 'contrasenasegura123!',
    'host': 'localhost',
    'port': '5432',
    'database': 'nba_stats'
}

def transform_and_load_games(csv_path='nba_games.csv'):
    try:
        # 1. Leer el archivo CSV
        print(f"Leyendo archivo {csv_path}...")
        games_df = pd.read_csv(csv_path)
        
        # 2. Verificar columnas mínimas requeridas
        required_columns = {
            'GAME_ID': 'game_id',
            'GAME_DATE': 'date_from',
            'HOME_TEAM_ID': 'home_team_id',
            'VISITOR_TEAM_ID': 'away_team_id',
            'HOME_TEAM_SCORE': 'home_points',
            'VISITOR_TEAM_SCORE': 'away_points',
            'SEASON': 'season'
        }
        
        # Convertir nombres de columnas a minúsculas para comparación
        games_df.columns = games_df.columns.str.lower()
        required_lower = {k.lower(): v for k, v in required_columns.items()}
        
        missing_cols = [col for col in required_lower.keys() if col not in games_df.columns]
        if missing_cols:
            raise ValueError(f"Columnas requeridas faltantes: {missing_cols}")
        
        # 3. Renombrar columnas (opcional, puedes mantener los nombres originales)
        games_df = games_df.rename(columns=required_lower)
        
        # 4. Transformación de datos
        print("Transformando datos...")
        
        # Convertir game_id a entero
        games_df['game_id'] = pd.to_numeric(games_df['game_id'], errors='coerce').fillna(0).astype('int64')
        
        # Convertir fecha al formato correcto
        games_df['date_from'] = pd.to_datetime(games_df['date_from'], errors='coerce').dt.strftime('%Y-%m-%d')
        
        # Extraer season_id del formato "2022-23"
        games_df['season_id'] = games_df['season'].str[:4].astype(int)
        
        # Convertir puntuaciones a enteros
        for col in ['home_points', 'away_points']:
            games_df[col] = pd.to_numeric(games_df[col], errors='coerce').fillna(0).astype('int64')
        
        # 5. Seleccionar solo las columnas necesarias para la tabla games
        final_columns = ['game_id', 'season_id', 'date_from', 'home_team_id', 
                        'away_team_id', 'home_points', 'away_points']
        games_df = games_df[final_columns]
        
        # 6. Conectar a PostgreSQL y cargar datos
        print("Conectando a la base de datos...")
        engine = create_engine(
            f"postgresql+psycopg2://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
            f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        )
        
        # 7. Insertar datos en la tabla games
        print("Insertando datos en la tabla games...")
        games_df.to_sql(
            name='games',
            con=engine,
            if_exists='append',
            index=False,
            method='multi',
            chunksize=1000
        )
        
        print(f"✅ ¡Datos insertados correctamente! {len(games_df)} registros cargados.")
        
        # 8. Opcional: Guardar archivo transformado
        transformed_path = 'nba_games_transformed.csv'
        games_df.to_csv(transformed_path, index=False)
        print(f"Archivo transformado guardado como {transformed_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante el proceso: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== INICIO DEL PROCESO DE CARGA DE GAMES ===")
    success = transform_and_load_games()
    
    if success:
        print("🎉 ¡Proceso completado con éxito!")
    else:
        print("⚠️ Hubo problemas durante el proceso. Verifica los mensajes de error.")