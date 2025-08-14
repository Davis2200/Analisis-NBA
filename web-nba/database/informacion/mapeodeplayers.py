import pandas as pd
import os
from datetime import datetime

def adapt_players(input_path='nba_players.csv', output_path='nba_players_adapted.csv'):
    try:
        df = pd.read_csv(input_path)
        
        # Conversión de tipos según esquema de la base de datos
        type_conversions = {
            'PLAYER_ID': 'int64',
            'PLAYER_NAME': 'str',
            'TEAM_ID': 'int64',
            'TEAM_ABBREVIATION': 'str',
            'AGE': 'int64',
            'HEIGHT': 'str',  # Se mantiene como string (ej. "6-8")
            'WEIGHT': 'float64',
            'POSITION': 'str'
        }
        
        # Aplicar conversiones solo para columnas existentes
        for col, dtype in type_conversions.items():
            if col in df.columns:
                try:
                    if dtype == 'str':
                        # Para strings, asegurar longitud máxima según esquema
                        df[col] = df[col].astype(str)
                        if col == 'POSITION':
                            df[col] = df[col].str[:5]  # VARCHAR(5) en la base
                    elif dtype == 'int64':
                        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype('int64')
                    elif dtype == 'float64':
                        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0).astype('float64')
                except Exception as e:
                    print(f"Advertencia: No se pudo convertir {col} a {dtype}: {str(e)}")
        
        # Guardar CSV adaptado
        df.to_csv(output_path, index=False)
        print(f"✅ Players adaptado guardado como {output_path}")
        return df
        
    except Exception as e:
        print(f"❌ Error adaptando players: {str(e)}")
        return None

def adapt_games(input_path='nba_games.csv', output_path='nba_games_adapted.csv'):
    try:
        df = pd.read_csv(input_path)
        
        # Conversión de tipos según esquema
        type_conversions = {
            'GAME_ID': 'int64',
            'SEASON': 'str',  # VARCHAR(10) en la base
            'GAME_DATE': 'datetime64[ns]',
            'HOME_TEAM_ID': 'int64',
            'VISITOR_TEAM_ID': 'int64',
            'HOME_TEAM_SCORE': 'int64',
            'VISITOR_TEAM_SCORE': 'int64'
        }
        
        for col, dtype in type_conversions.items():
            if col in df.columns:
                try:
                    if dtype == 'datetime64[ns]':
                        df[col] = pd.to_datetime(df[col], errors='coerce')
                    elif dtype == 'int64':
                        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype('int64')
                    elif dtype == 'str':
                        df[col] = df[col].astype(str)
                        if col == 'SEASON':
                            df[col] = df[col].str[:10]  # VARCHAR(10) en la base
                except Exception as e:
                    print(f"Advertencia: No se pudo convertir {col} a {dtype}: {str(e)}")
        
        # Guardar CSV adaptado
        df.to_csv(output_path, index=False)
        print(f"✅ Games adaptado guardado como {output_path}")
        return df
        
    except Exception as e:
        print(f"❌ Error adaptando games: {str(e)}")
        return None

def adapt_player_stats(input_path='nba_players_stats.csv', output_path='nba_player_stats_adapted.csv'):
    try:
        df = pd.read_csv(input_path)
        
        # Conversión de tipos según esquema
        type_conversions = {
            'GAME_ID': 'int64',
            'TEAM_ID': 'int64',
            'TEAM_ABBREVIATION': 'str',  # VARCHAR(10)
            'PLAYER_ID': 'int64',
            'PLAYER_NAME': 'str',  # VARCHAR(100)
            'START_POSITION': 'str',  # VARCHAR(5)
            'MIN': 'str',  # Se convertirá a decimal
            'FGM': 'int64',
            'FGA': 'int64',
            'FG_PCT': 'float64',
            'FG3M': 'int64',
            'FG3A': 'int64',
            'FG3_PCT': 'float64',
            'FTM': 'int64',
            'FTA': 'int64',
            'FT_PCT': 'float64',
            'OREB': 'int64',
            'DREB': 'int64',
            'REB': 'int64',
            'AST': 'int64',
            'STL': 'int64',
            'BLK': 'int64',
            'TO': 'int64',  # "to" es palabra reservada
            'PF': 'int64',
            'PTS': 'int64',
            'PLUS_MINUS': 'int64',
            'SEASON': 'str'  # VARCHAR(10)
        }
        
        for col, dtype in type_conversions.items():
            if col in df.columns:
                try:
                    if col == 'MIN':
                        # Convertir minutos MM:SS a decimal
                        df[col] = df[col].apply(
                            lambda x: float(x.split(':')[0]) + float(x.split(':')[1])/60 
                            if isinstance(x, str) and ':' in x else 0.0
                        )
                    elif dtype == 'int64':
                        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype('int64')
                    elif dtype == 'float64':
                        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0).astype('float64')
                    elif dtype == 'str':
                        df[col] = df[col].astype(str)
                        if col == 'TEAM_ABBREVIATION':
                            df[col] = df[col].str[:10]
                        elif col == 'PLAYER_NAME':
                            df[col] = df[col].str[:100]
                        elif col == 'START_POSITION':
                            df[col] = df[col].str[:5]
                        elif col == 'SEASON':
                            df[col] = df[col].str[:10]
                except Exception as e:
                    print(f"Advertencia: No se pudo convertir {col} a {dtype}: {str(e)}")
        
        # Guardar CSV adaptado
        df.to_csv(output_path, index=False)
        print(f"✅ Player stats adaptado guardado como {output_path}")
        return df
        
    except Exception as e:
        print(f"❌ Error adaptando player stats: {str(e)}")
        return None

if __name__ == "__main__":
    print("=== Iniciando adaptación de archivos CSV ===")
    
    # Adaptar todos los archivos en el directorio actual
    players_df = adapt_players()
    games_df = adapt_games()
    stats_df = adapt_player_stats()
    
    # Mostrar resumen
    print("\nResumen de adaptación:")
    print(f"- Players: {'✅' if players_df is not None else '❌'} ({len(players_df) if players_df is not None else 0} registros)")
    print(f"- Games: {'✅' if games_df is not None else '❌'} ({len(games_df) if games_df is not None else 0} registros)")
    print(f"- Player Stats: {'✅' if stats_df is not None else '❌'} ({len(stats_df) if stats_df is not None else 0} registros)")
    
    print("\n🎉 Proceso completado! Los archivos adaptados se han guardado en el directorio actual.")