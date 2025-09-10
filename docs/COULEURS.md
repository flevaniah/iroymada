# 🎨 Système de Couleurs Airbnb - Iroy

Ce document décrit le système de couleurs centralisé du projet Iroy, inspiré de la palette d'Airbnb. Il permet de gérer facilement les couleurs principales et secondaires sans modifier le code de chaque composant.

## 🏗️ Architecture

Le système utilise des variables CSS définies dans `app/globals.css` et configurées dans `tailwind.config.ts`.

### Variables CSS Principales (Style Airbnb)

```css
/* Couleurs principales Airbnb */
--coral: 0 65% 51%;              /* #FF5A5F - Rouge corail signature */
--teal: 177 70% 41%;             /* #00A699 - Teal d'Airbnb */
--orange: 28 100% 52%;           /* #FC642D - Orange vibrant */
--yellow: 49 100% 50%;           /* #FFB400 - Jaune chaleureux */
```

## 🎯 Couleurs Globales Airbnb

### 🌺 Coral (Rouge Corail)
- **Utilisation** : Couleur primaire, boutons principaux, urgences 24/7, alertes critiques
- **Classes Tailwind** : `bg-coral`, `text-coral`, `border-coral`
- **Variantes** : `coral-light`, `coral-lighter`, `coral-dark`, `coral-foreground`
- **Hex** : `#FF5A5F`

### 🌊 Teal (Bleu-Vert)
- **Utilisation** : Actions positives, centres ouverts, parking disponible, succès
- **Classes Tailwind** : `bg-teal`, `text-teal`, `border-teal`
- **Variantes** : `teal-light`, `teal-lighter`, `teal-foreground`
- **Hex** : `#00A699`

### 🟠 Orange (Orange Vibrant)
- **Utilisation** : Actions secondaires, notifications importantes
- **Classes Tailwind** : `bg-orange`, `text-orange`, `border-orange`
- **Variantes** : `orange-light`, `orange-lighter`, `orange-foreground`
- **Hex** : `#FC642D`

### 🟡 Yellow (Jaune Chaleureux)
- **Utilisation** : Avertissements, centres en attente de validation
- **Classes Tailwind** : `bg-yellow`, `text-yellow`, `border-yellow`
- **Variantes** : `yellow-light`, `yellow-lighter`, `yellow-foreground`
- **Hex** : `#FFB400`

### ⚫ Gray Scale (Nuances de Gris)
- **Utilisation** : Textes, arrière-plans, bordures, éléments neutres
- **Classes Tailwind** : `bg-gray-50` à `bg-gray-900`, `text-gray-50` à `text-gray-900`
- **Variantes** : 10 nuances complètes (50, 100, 200, 300, 400, 500, 600, 700, 800, 900)

## 🔄 Variables Sémantiques

Pour faciliter l'usage, les couleurs sont également disponibles avec des noms sémantiques :

```css
--success: var(--teal);          /* Succès = Teal */
--danger: var(--coral);          /* Danger = Coral */
--warning: var(--yellow);        /* Avertissement = Yellow */
--info: 217 91% 60%;            /* Information = Bleu */
```

## 🛠️ Utilisation

### 1. Classes Tailwind
```jsx
// Badge urgence (coral)
<span className="bg-coral-light text-coral px-2 py-1 rounded">
  Urgence 24/7
</span>

// Badge disponible (teal)
<span className="bg-teal-light text-teal px-2 py-1 rounded">
  Ouvert
</span>

// Badge accessibilité (info)
<span className="bg-info-light text-info px-2 py-1 rounded">
  Accessible PMR
</span>
```

### 2. Composant Badge
```jsx
import { Badge } from '@/components/ui/badge'

// Couleurs globales
<Badge variant="coral">Urgence</Badge>
<Badge variant="teal">Ouvert</Badge>
<Badge variant="orange">Action</Badge>
<Badge variant="yellow">Attention</Badge>

// Variantes sémantiques
<Badge variant="success">Succès</Badge>
<Badge variant="danger">Erreur</Badge>
<Badge variant="warning">Avertissement</Badge>
<Badge variant="info">Information</Badge>
```

## 🌓 Mode Sombre

Le système supporte automatiquement le mode sombre avec des variantes adaptées :

```css
.dark {
  --emergency: 0 91% 71%;        /* Rouge plus clair */
  --available: 142 84% 47%;      /* Vert plus clair */
  --info: 217 91% 71%;          /* Bleu plus clair */
  --warning: 45 93% 67%;        /* Jaune plus clair */
}
```

## 🔄 Modification des Couleurs

### Changer les couleurs principales

1. **Modifier les variables dans `app/globals.css`** :
```css
:root {
  --primary: 142 76% 36%; /* Actuellement vert */
}
```

2. **Les changements s'appliquent automatiquement** à tous les composants utilisant `bg-primary`, `text-primary`, etc.

### Changer les couleurs sémantiques

```css
/* Exemple : passer du rouge au orange pour les urgences */
--emergency: 25 95% 53%; /* Orange au lieu de rouge */
```

## 📱 Exemples d'Usage

### Badges de Statut
```jsx
// Centre ouvert 24/7
{hasEmergency && (
  <Badge variant="emergency">24/7</Badge>
)}

// Centre ouvert
{isOpen && (
  <Badge variant="available">Ouvert</Badge>
)}

// Centre accessible
{isAccessible && (
  <Badge variant="info">♿ Accessible</Badge>
)}
```

### États d'Interface
```jsx
// Message d'erreur
<div className="bg-emergency-light border border-emergency-border p-4 rounded">
  <p className="text-emergency">Une erreur est survenue</p>
</div>

// Message de succès  
<div className="bg-available-light border border-available-border p-4 rounded">
  <p className="text-available">Centre ajouté avec succès</p>
</div>
```

## 🎨 Palette de Couleurs

### Couleurs Actuelles (HSL)
- **Coral** : `hsl(0, 65%, 51%)` - Rouge corail Airbnb (#FF5A5F)
- **Teal** : `hsl(177, 70%, 41%)` - Teal Airbnb (#00A699)
- **Orange** : `hsl(28, 100%, 52%)` - Orange vibrant (#FC642D)
- **Yellow** : `hsl(49, 100%, 50%)` - Jaune chaleureux (#FFB400)

### Facilité de Modification
Pour changer vers une autre palette, modifier les variables principales :
```css
:root {
  --coral: 220 100% 50%;      /* Bleu à la place du coral */
  --teal: 120 100% 40%;       /* Vert à la place du teal */
  --primary: var(--coral);    /* Le primaire suit automatiquement */
}
```

## ✅ Avantages

1. **Centralisation** : Toutes les couleurs en un seul endroit
2. **Cohérence** : Couleurs sémantiques uniformes
3. **Maintenance** : Changement global en modifiant une variable
4. **Dark Mode** : Support automatique
5. **Accessibilité** : Contraste optimisé pour chaque thème
6. **Flexibilité** : Adaptation facile pour différents contextes (Madagascar, autres pays)

## 🚀 Migration

Pour migrer d'anciennes couleurs hardcodées :

```jsx
// Ancien
<span className="bg-red-100 text-red-700">Urgence</span>

// Nouveau avec couleurs Airbnb
<span className="bg-coral-light text-coral">Urgence</span>
// Ou avec Badge :
<Badge variant="coral">Urgence</Badge>
// Ou sémantique :
<Badge variant="danger">Urgence</Badge>
```