# CartMind — AI-Powered Smart Shopping Assistant

> **"Your budget. Your needs. Your smartest cart."**

CartMind helps users create an optimized shopping cart based on their budget, requirements, preferences, and product priorities. Instead of recommending isolated individual products, CartMind uses a hybrid architecture of **Groq AI (Llama 3.3 70B)** and a **deterministic knapsack optimization engine** to build the best possible combination of items strictly within a target spending limit.

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Shopping Assistant (Phase 2 — Powered by Groq)
- **Natural-Language Understanding:** Interprets user shopping queries in plain English (e.g., *"I need a college student setup with wireless headphones, a laptop stand, a mouse, and a backpack under ₹15,000. Prioritize quality and value for money."*).
- **Structured Intent Extraction:** Uses Groq (`llama-3.3-70b-versatile`) to extract target budget, categories, required items, preferred brands, and priority tradeoffs.
- **AI Cart Analysis:** Generates an intelligent cart summary explaining how the chosen combination satisfies the user's requirements, provides great value, and utilizes the available budget.
- **Product Selection Rationale:** Explains why each item was selected for the user's specific priority.
- **Smart Alternatives Advice:** Analyzes real catalog alternatives and suggests whether swapping items makes sense based on budget headroom.
- **Strict Budget Guarantee & Zero Hallucinations:** Recommendations use the verified 28-product catalog as the source of truth. The deterministic knapsack optimizer calculates the final cart and strictly guarantees `totalCost <= budget`.
- **Graceful Fallback:** If the Groq API key is not set or network issues occur, CartMind automatically falls back to the deterministic engine so the application remains 100% functional.

### 2. 🏠 Home / Shopping Dashboard (`/`)
- Modern SaaS aesthetic with light theme and subtle purple/indigo accents (`violet-600`, `indigo-600`).
- Live shopping statistics:
  - Catalog items available (28 verified products).
  - Current cart value and remaining target budget tracking.
- Pre-configured instant starters:
  - **College Student Setup** (Budget: ₹15,000)
  - **Productive Desk Essentials** (Budget: ₹8,000)
  - **Hostel Living & Study Kit** (Budget: ₹6,000)
- Step-by-step walkthrough explaining the multi-item knapsack advantage over traditional recommendation systems.

### 3. 📦 Product Catalog (`/products`)
- 28 realistic Indian products with INR (₹) pricing across 5 core categories:
  - **Electronics**
  - **Accessories**
  - **Study Essentials**
  - **Home & Living**
  - **Lifestyle**
- Multi-dimensional filtering and sorting:
  - Real-time search across product names, descriptions, brands, and tags.
  - Category filters with active product counts.
  - Brand filter (boAt, Sony, Logitech, Xiaomi, Wipro, Milton, etc.).
  - Sorting by Price (Low to High / High to Low), Rating (Highest first), and Featured picks.
- Interactive product cards with discount badges, specification previews, and live in-cart quantity counters.
- Full product details modal with complete specifications table and tags.

### 4. 🧠 Smart Cart Builder (`/builder`)
- **Total Shopping Budget (INR):** Interactive numeric input with step buttons (`+/- ₹1,000`) and quick presets (₹5,000, ₹10,000, ₹15,000, ₹25,000, ₹50,000).
- **Natural Language Requirements:** Textarea with pre-filled quick starter templates.
- **Priority Selector:**
  - *Lowest Price* (Maximizes savings while maintaining quality thresholds)
  - *Best Value for Money* (Optimal satisfaction-to-price ratio)
  - *Best Quality* (Prioritizes highest ratings, specifications, and verified reputation)
- **Brand Preferences:** Optional multi-select bonus weighting for preferred brands (boAt, Sony, Logitech, etc.).
- **Live AI Loading & Status:** Animated feedback while Groq processes requests and checks catalog constraints.
- **Interactive Results Management:**
  - Dynamic visual budget utilization progress bar.
  - Swap any recommended item with an alternative with one click (with dynamic headroom budget checking).
  - Remove items with immediate real-time recalculation of total cost, remaining budget, and utilization percentage.
  - Manually add complementary items that fit within unspent budget.
  - Transfer the optimized combination directly into the active shopping cart with one click.

### 5. 🛒 Shopping Cart (`/cart`)
- Displays all selected items with individual prices, MRP savings, and item subtotal.
- Responsive quantity steppers (`-` / `+`).
- Item removal with automatic subtotal recalculation.
- Visual Budget Progress meter showing live spent vs configured session budget.
- Local inline budget adjuster.
- **LocalStorage persistence:** Cart items and budget settings persist across page reloads.

---

## 🛠️ Technology Stack

- **Frontend:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 + Vanilla CSS Design System
- **Icons:** Lucide React
- **Routing:** React Router v7 (`react-router-dom`)
- **Backend:** Node.js + Express
- **AI SDK:** Official `groq-sdk` (Groq API, OpenAI-compatible format)
- **Environment Management:** `dotenv`
- **State & Persistence:** React Context API + LocalStorage
- **Dataset:** 28 curated realistic Indian products in `src/data/products.js`

---

## 🔑 Groq API Setup Instructions

To activate full Groq LLM natural language parsing and AI cart narratives:

1. **Obtain a Groq API Key:**
   - Sign up or log in at [Groq Console](https://console.groq.com/).
   - Navigate to **API Keys** at [https://console.groq.com/keys](https://console.groq.com/keys).
   - Click **Create API Key**, copy your secret key (starts with `gsk_...`).

2. **Configure Environment Variables:**
   - In the project directory, create a `.env` file inside the `backend/` folder:
     ```bash
     # Copy the template
     cp backend/.env.example backend/.env
     ```
   - Open `backend/.env` and paste your key:
     ```env
     PORT=5000
     GROQ_API_KEY=gsk_your_actual_key_here
     GROQ_MODEL=llama-3.3-70b-versatile
     ```

3. **Verify Connectivity:**
   - Run the automated backend Groq test script:
     ```bash
     npm run test:groq
     ```
   - The script will test configuration, ping the Groq model, parse a sample request, verify recommendations against the real catalog, and check budget compliance.

---

## 🚀 Running the Application Locally

### 1. Install Dependencies
```bash
# Install root/frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Start the Backend Server (Port 5000)
```bash
npm run server
```
*Output should display:*
```
=========================================
 CartMind Backend running on port 5000
 API Base: http://localhost:5000/api/ai
 Groq API Configured: YES / NO
 Groq Model: llama-3.3-70b-versatile
=========================================
```

### 3. Start the Frontend Development Server (Port 5173)
In a separate terminal window:
```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Open your browser and navigate to:
👉 **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)**

> **Note on Vite Proxy:** The frontend dev server automatically proxies all `/api` requests to `http://localhost:5000`. You do not need to configure custom ports or CORS on the frontend.

---

## 🔌 Backend API Endpoints

The Express backend exposes the following endpoints under `/api/ai`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ai/health` | Health check & Groq configuration status |
| `POST` | `/api/ai/test` | Pings Groq API to test connectivity and key validity |
| `POST` | `/api/ai/parse-request` | Parses natural language query into structured shopping parameters |
| `POST` | `/api/ai/recommendations` | Calculates verified budget-enforced cart & enriches with Groq AI explanations |
| `POST` | `/api/ai/alternatives` | Identifies catalog alternatives with budget headroom and Groq swap advice |

---

## 💡 How Budget Optimization Works

CartMind uses a hybrid two-tier architecture:

1. **Semantic Parsing Tier (Groq AI):**
   - Groq extracts the user's intended items (e.g. *headphones, mouse, laptop stand, backpack*), target budget, and priority (*lowest-price*, *best-value*, *best-quality*).
2. **Deterministic Constraint Solver Tier:**
   - The verified 28-product catalog is passed to our combinatorial knapsack optimizer (`src/utils/optimizer.js` & `backend/services/shoppingService.js`).
   - The optimizer evaluates candidate products for each slot, ranking them by the user's priority metric.
   - If a combination exceeds the budget, it systematically downscales items to cheaper valid alternatives until `totalCost <= budget`.
   - Never hallucinates non-existent products, fabricated prices, or fake ratings.
3. **AI Explanation & Synthesis Tier (Groq AI):**
   - The verified items and computed totals are returned to Groq to generate a human-readable cart summary, value analysis, and per-item reasoning.
4. **Fallback Mechanism:**
   - If Groq is unavailable, the deterministic knapsack solver runs locally on the client or backend, guaranteeing that CartMind is always usable.

---

## 📁 Project Structure

```
cartmind/
├── backend/
│   ├── controllers/
│   │   └── aiController.js          # Express request handlers for AI endpoints
│   ├── data/
│   │   └── products.js              # Catalog accessor & compact representations
│   ├── routes/
│   │   └── aiRoutes.js              # Route definitions for /api/ai
│   ├── services/
│   │   ├── groqService.js           # Groq SDK client, parsing, & explanations
│   │   └── shoppingService.js       # Verified catalog optimizer & budget enforcement
│   ├── .env.example                 # Backend environment variable template
│   ├── package.json                 # Backend dependencies (express, cors, groq-sdk, dotenv)
│   ├── server.js                    # Express server entry point
│   └── test-groq.js                 # Verification test suite for Groq & recommendations
├── src/
│   ├── components/
│   │   ├── BudgetInput.jsx          # INR budget input with presets and step buttons
│   │   ├── BudgetProgress.jsx       # Visual progress bar with status thresholds
│   │   ├── CartItem.jsx             # Cart item row with quantity stepper
│   │   ├── CategoryFilter.jsx       # Category filter chips with product counts
│   │   ├── Footer.jsx               # SaaS footer with brand and phase notices
│   │   ├── Navbar.jsx               # Navigation bar with budget widget & Groq AI badge
│   │   ├── ProductCard.jsx          # Product card with hover effects and in-cart counter
│   │   ├── ProductModal.jsx         # Detailed specifications modal
│   │   ├── RecommendationCard.jsx   # Recommendation card with AI rationale & alternatives
│   │   └── Toast.jsx                # Toast notification system
│   ├── context/
│   │   └── CartContext.jsx          # Cart state, actions, and LocalStorage persistence
│   ├── data/
│   │   ├── products.json            # Curated catalog of 28 products across 5 categories
│   │   └── products.js              # Universal ES module dataset export
│   ├── pages/
│   │   ├── BuilderPage.jsx          # Smart Cart Builder & AI optimization dashboard
│   │   ├── CartPage.jsx             # Shopping cart with order summary and budget meter
│   │   ├── HomePage.jsx             # Home dashboard with hero, statistics & presets
│   │   └── ProductsPage.jsx         # Product catalog with search, filter & sort
│   ├── utils/
│   │   ├── aiApi.js                 # Frontend API client with automatic fallback
│   │   ├── formatters.js            # Formatters for INR (₹) and discount calculations
│   │   └── optimizer.js             # Knapsack budget optimization engine
│   ├── App.jsx                      # Routing, layout shell, and scroll-to-top handler
│   ├── index.css                    # Tailwind CSS v4, custom scrollbar & typography
│   └── main.jsx                     # Vite React entry point
├── .env.example                     # Root environment template
├── .gitignore                       # Ignores .env and node_modules
├── package.json                     # Root scripts and frontend dependencies
├── README.md                        # Complete project documentation
└── vite.config.js                   # Vite & proxy configuration
```

---

## ✅ Phase 2 Verification Checklist

- [x] Backend created with Express, `groq-sdk`, `dotenv`, and `cors`.
- [x] Groq configured with `GROQ_API_KEY` and `GROQ_MODEL` (`llama-3.3-70b-versatile`).
- [x] Sensitive keys excluded from source code; `.env.example` created.
- [x] `POST /api/ai/parse-request`, `POST /api/ai/recommendations`, and `POST /api/ai/alternatives` implemented and tested.
- [x] Real catalog used as source of truth; zero hallucinations.
- [x] Strict budget constraint mathematically enforced (`totalCost <= budget`).
- [x] AI cart summary and per-item rationale displayed on frontend.
- [x] Alternatives explained with real catalog products and budget headroom checks.
- [x] Graceful fallback to deterministic optimizer if Groq is offline or key is unconfigured.
- [x] Full production build (`npm run build`) passing with zero errors.
