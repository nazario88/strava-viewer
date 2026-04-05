# Strava Viewer (Analytics Dashboard)

Une application web moderne pour analyser vos données Strava avec des graphiques interactifs et une heatmap d'activités.

## 🚀 Démo en ligne

**Essayez directement :** [https://strava.dailyheroes.io](https://strava.dailyheroes.io)

Connectez-vous avec votre compte Strava et explorez vos données immédiatement !

## ✨ Fonctionnalités

### 📊 **Graphiques et métriques**
- **Distance totale** sur l'année en cours
- **Nombre d'activités** du mois courant  
- **Graphique linéaire** : Distance par semaine (12 dernières semaines)
- **Histogramme** : Distance mensuelle (12 derniers mois)
- **Graphique donut** : Répartition par type d'activité
- **Heatmap GitHub-style** : Activités de l'année avec icônes par sport

### 🎨 **Interface moderne**
- **Mode sombre/clair** avec toggle automatique
- **Design responsive** : Optimisé mobile et desktop
- **Heatmap adaptative** : Vue complète sur desktop, 2 blocs semestriels sur mobile
- **Animations fluides** avec Chart.js
- **Icônes d'activités** : Course 🏃‍♂️, Vélo 🚴‍♂️, Natation 🏊‍♂️, etc.

## 🛠️ Technologies utilisées

- **Frontend** : Vue.js 3 (Composition API), Vite, Tailwind CSS
- **Charts** : Chart.js
- **Backend** : PHP (endpoint OAuth sécurisé)
- **API** : Strava API v3

## 🏗️ Installation pour auto-hébergement

### Prérequis

- Node.js 18+ et npm
- Serveur web avec PHP 7.4+
- Compte développeur Strava

### Créer une application Strava

1. Rendez-vous sur [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Cliquez sur "Create & Manage Your App"
3. Remplissez les informations :
  - **Application Name** : "Mon Dashboard Strava"
  - **Category** : "Data Importer"
  - **Website** : `https://votre-domaine.com`
  - **Authorization Callback Domain** : `votre-domaine.com`
4. Notez votre **Client ID** et **Client Secret**

### Configuration backend PHP

Modifiez le fichier `api/config.php` avec vos credentials Strava obtenus à l'étape précédente.