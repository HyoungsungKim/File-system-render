import pandas as pd
import json

excel_data_df = pd.read_excel("20221201_T_MONITOR.xlsx", sheet_name="Sheet1")

json_df = excel_data_df.to_json(orient="records")

json_dict = json.loads(json_df)

with open("data.json", 'w') as json_file:
    json.dump(json_dict, json_file, ensure_ascii=False, indent=4)