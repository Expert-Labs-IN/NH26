# 🛡️ FraudShield | Real-Time Fraud Intelligence 

**FraudShield** is a state-of-the-art, high-density fraud monitoring dashboard designed for real-time transaction intelligence. It leverages reactive data streams to detect fraudulent patterns such as impossible travel, velocity spikes, and high-risk merchant categories.

## 📊 Key Features

- **Real-Time Fraud Feed**: Live-streaming alerts for suspicious transactions with instant "Freeze" or "Safe" action capabilities.
- **Dynamic Risk Intelligence**: Includes Impossible Travel detection, Velocity Spikes, and Heatmap analysis of incident density.
- **Advanced Data Visualizations**: Comparing legitimate vs. fraudulent transaction volumes through interactive charts (using `Recharts` and `D3`).
- **AI Insights Ready**: Integrated AI notification system that surfaces newly detected fraud patterns and anomalies.
- **Data Portability**: Full support for exporting comprehensive dashboard data into PDF reports.
- **Live Attack Simulation**: Toggle dynamic transaction attacks to test detection thresholds and system response.

## You can also view this project at : https://fraudscope-xi.vercel.app/

## 📁 Project Structure

```bash
src/
├── app/                  # Next.js App Router (Pages & API Routes)
├── components/           
│   ├── dashboard/       # Core analytics & chart components
│   ├── ai/              # AI-driven conversation & insight UI
│   ├── pdf/             # PDF generation and export logic
│   └── ui/              # Reusable high-density UI primitives
└── lib/                 # Shared data loaders and utility functions
```
<img width="520" height="901" alt="image" src="https://github.com/user-attachments/assets/c7f8de57-3ed4-40c4-b478-1f825b179d7b" />







## 📈 Dashboard Highlights

- **Transaction Velocity**: 24-hour comparative monitoring of txn volume.
- **Geographic Risk Map**: Visualizing global exposure and incident hotspots.
- **Threat Radar**: Mapping multi-dimensional risk scores across diverse categories.
- **Heatmap Intelligence**: Analyzing peak hours for fraudulent activity across the week.

## ⚖️ License

Private Project. Created for high-density fraud monitoring and intelligence.
