import pandas as pd
from sqlalchemy import create_engine
# Configuración de PostgreSQL
DB_CONFIG = {
    'user': 'aadmin',
    'password': 'contrasenasegura123!',
    'host': 'localhost',
    'port': '5432',
    'database': 'nba_stats'
}

def load_games(csv_path='nba_games_adapted.csv'):
    try:
        # 1. Leer CSV
        df = pd.read_csv(csv_path)
        
        # 2. Verificar columnas (en minúsculas)
        required_cols = ['game_id', 'season_id', 'date_from', 
                        'home_team_id', 'away_team_id',
                        'home_points', 'away_points']
        
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            print(f"Faltan columnas: {missing}")
            print(f"Columnas encontradas: {list(df.columns)}")
            return False
        
        # 3. Convertir tipos de datos
        df['date_from'] = pd.to_datetime(df['date_from'])
        int_cols = ['game_id', 'season_id', 'home_team_id', 'away_team_id', 
                   'home_points', 'away_points']
        df[int_cols] = df[int_cols].astype('int64')
        
        # 4. Conectar y cargar
        engine = create_engine(
            f"postgresql+psycopg2://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
            f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        )
        
        df.to_sql('games', engine, if_exists='append', index=False)
        print(f"✅ Datos cargados: {len(df)} registros")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== CARGA DE DATOS DE GAMES ===")
    if load_games():
        print("🎉 Carga completada")
    else:
        print("⚠️ Falló la carga")