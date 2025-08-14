import pandas as pd
from sqlalchemy import create_engine
import re

def cargar_estadisticas():
    # Configuración de conexión
    DB_URL = "postgresql+psycopg2://aadmin:contrasenasegura123!@localhost:5432/nba_stats"
    CSV_FILE = "nba_player_stats_adapted.csv"
    TABLE_NAME = "player_statistics"

    try:
        print("🔍 Analizando estructura del CSV...")
        
        # 1. Leer CSV manteniendo la estructura original
        df = pd.read_csv(CSV_FILE)
        print(f"Columnas detectadas: {len(df.columns)}")
        print(f"Filas detectadas: {len(df)}")
        
        # 2. Verificar si ya está en formato largo
        if 'game_id' in df.columns and 'player_id' in df.columns:
            print("✅ Datos ya en formato largo (game_id y player_id presentes)")
            df_final = df.copy()
        else:
            # 3. Buscar columnas con formato de juego
            game_pattern = re.compile(r'_m(\d+)$')
            game_cols = [col for col in df.columns if game_pattern.search(col)]
            
            if not game_cols:
                raise ValueError("No se encontraron columnas con formato _mXXX")
            
            print(f"🎯 Juegos detectados: {len(set(game_pattern.findall(' '.join(game_cols))))}")
            
            # 4. Transformar a formato largo
            data_frames = []
            for col in game_cols:
                match = game_pattern.search(col)
                game_id = match.group(1)
                stat_name = col[:match.start()]
                
                temp_df = df[['player_id', 'player_name', 'team_id']].copy()
                temp_df['game_id'] = game_id
                temp_df['stat_name'] = stat_name
                temp_df['stat_value'] = df[col]
                
                data_frames.append(temp_df)
            
            df_final = pd.concat(data_frames, ignore_index=True)
            print(f"🔄 Transformado a formato largo: {len(df_final)} registros")

        # 5. Cargar a PostgreSQL
        engine = create_engine(DB_URL)
        df_final.to_sql(
            name=TABLE_NAME,
            con=engine,
            if_exists='append',
            index=False,
            chunksize=1000
        )
        
        print(f"✅ ¡Datos cargados exitosamente! {len(df_final)} registros")
        return True

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("Posibles soluciones:")
        print("- Verifica que el CSV tenga columnas con formato _mXXX (ej. pts_m123)")
        print("- Asegúrate que la tabla en PostgreSQL tenga las columnas correctas")
        return False

if __name__ == "__main__":
    cargar_estadisticas()