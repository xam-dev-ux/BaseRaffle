# BaseRaffle

Aplicación de rifas descentralizada en Base con Chainlink VRF para selección aleatoria de ganadores verificable on-chain.

## Estructura del Proyecto

```
BaseRaffle/
├── contracts/          # Smart contracts (Hardhat + Foundry)
│   ├── src/           # Código fuente del contrato
│   ├── test/          # Tests de Foundry
│   └── script/        # Scripts de deployment
└── frontend/          # Frontend React + Vite
    ├── src/           # Código fuente
    └── public/        # Assets estáticos y manifest
```

## Requisitos Previos

- Node.js 18+
- pnpm, npm o yarn
- Foundry (para tests y deployment con forge)
- Cuenta en Chainlink VRF con subscription activa
- ETH en Base (mainnet o Sepolia para tests)

## Smart Contract

### Instalación

```bash
cd contracts
npm install
```

### Configuración

1. Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env
```

2. Edita `.env` con tus valores:

```env
# Clave privada del deployer (sin 0x)
DEPLOYER_PRIVATE_KEY=tu_clave_privada

# RPCs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# BaseScan API Key para verificación
BASESCAN_API_KEY=tu_api_key

# Chainlink VRF Subscription ID
VRF_SUBSCRIPTION_ID=tu_subscription_id

# Fee del protocolo en Basis Points (250 = 2.5%, máximo 1000 = 10%)
PROTOCOL_FEE_BPS=250
```

### Crear Subscription de Chainlink VRF

1. Ve a [Chainlink VRF](https://vrf.chain.link/)
2. Conecta tu wallet y selecciona Base (mainnet o Sepolia)
3. Crea una nueva subscription
4. Añade fondos LINK a la subscription
5. Copia el Subscription ID y ponlo en tu `.env`

### Compilar

```bash
# Con Hardhat
npm run compile

# Con Foundry
forge build
```

### Tests

```bash
# Tests de Foundry
npm run test:forge
# o directamente
forge test -vvv

# Tests de Hardhat
npm run test
```

### Deployment

#### Base Sepolia (Testnet)

```bash
npm run deploy:sepolia
```

#### Base Mainnet

```bash
npm run deploy:mainnet
```

### Después del Deployment

1. **Añade el contrato como consumer en tu VRF subscription**:
   - Ve a [Chainlink VRF](https://vrf.chain.link/)
   - Selecciona tu subscription
   - Añade la dirección del contrato desplegado como consumer

2. **Verifica el contrato en BaseScan**:
```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> "<VRF_COORDINATOR>" "<KEY_HASH>" "<SUBSCRIPTION_ID>" "<PROTOCOL_FEE_BPS>"
```

### Configuración del Contrato

El contrato tiene las siguientes configuraciones:

| Parámetro | Descripción |
|-----------|-------------|
| `PROTOCOL_FEE_BPS` | Fee del protocolo en basis points (configurable via .env) |
| `MAX_PROTOCOL_FEE_BPS` | Máximo fee permitido: 1000 (10%) |
| `MIN_DURATION` | Duración mínima de rifa: 1 hora |
| `MAX_DURATION` | Duración máxima de rifa: 30 días |

El owner puede cambiar el fee después del deployment:
```solidity
setProtocolFee(uint256 _newFeeBps)
```

---

## Frontend

### Instalación

```bash
cd frontend
npm install
```

### Configuración

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Edita `.env`:

```env
# RPCs (opcional - usa públicos por defecto)
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# WalletConnect Project ID (requerido para WalletConnect)
VITE_WALLETCONNECT_PROJECT_ID=tu_project_id
```

3. Actualiza las direcciones del contrato en `src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  [base.id]: '0xTU_DIRECCION_MAINNET',
  [baseSepolia.id]: '0xTU_DIRECCION_SEPOLIA',
};
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Build de Producción

```bash
npm run build
```

Los archivos de producción se generarán en `dist/`

### Despliegue

Puedes desplegar el frontend en cualquier servicio de hosting estático:

- **Vercel**: Conecta tu repo y despliega automáticamente
- **Netlify**: Conecta tu repo o arrastra la carpeta `dist/`
- **IPFS**: Sube la carpeta `dist/` a Pinata o similar

---

## Base Mini Apps

Para que tu app aparezca en la Base App:

### 1. Configura el Manifest

El archivo `public/.well-known/farcaster.json` debe contener:

```json
{
  "accountAssociation": {
    "header": "...",
    "payload": "...",
    "signature": "..."
  },
  "miniapp": {
    "version": "1",
    "name": "BaseRaffle",
    "homeUrl": "https://tu-dominio.app",
    "iconUrl": "https://tu-dominio.app/images/icon-1024.png",
    ...
  }
}
```

### 2. Genera la Account Association

1. Ve a Warpcast > Settings > Developer > Mini App Manifest Tool
2. Ingresa tu dominio
3. Copia los valores generados de `accountAssociation`

### 3. Prepara las Imágenes

| Imagen | Tamaño | Formato |
|--------|--------|---------|
| iconUrl | 1024x1024px | PNG (sin alpha) |
| splashImageUrl | 200x200px | PNG |
| heroImageUrl | 1200x630px | PNG |
| ogImageUrl | 1200x630px | PNG |
| screenshotUrls | 1284x2778px | PNG (hasta 3) |

### 4. Indexa tu App

1. Despliega tu frontend con el manifest configurado
2. Comparte la URL de tu Mini App en el feed social de Base/Warpcast
3. Espera hasta 10 minutos para que se indexe
4. Si haces cambios al manifest, vuelve a compartir la URL

### 5. Verifica

- El manifest debe ser accesible en `https://tu-dominio/.well-known/farcaster.json`
- Todas las imágenes deben ser accesibles y devolver headers `image/*`

---

## Funcionalidades

### Para Usuarios

- **Crear Rifas**: Define descripción, precio de ticket, máximo de tickets, duración
- **Comprar Tickets**: Compra múltiples tickets en una transacción
- **Ver Probabilidades**: Visualiza tus chances de ganar
- **Historial**: Consulta rifas pasadas y ganadores

### Para el Owner

- **Withdraw Fees**: Retira los fees del protocolo acumulados
- **Cambiar Fee**: Ajusta el porcentaje del fee (máximo 10%)

### Chainlink VRF

La selección del ganador usa Chainlink VRF V2.5 para garantizar:
- Aleatoriedad verificable on-chain
- Imposible de manipular
- Auditable por cualquiera

---

## Direcciones de Chainlink VRF

### Base Mainnet
- VRF Coordinator: `0xDf24F0718E2415Cc2B3A3fb12751E1A9428AcC97`
- Key Hash: `0x00b81c5ee9d42b3b70570c3c6b3d97affe3090e9e4b2aff3fb76b21f2ce80a85`

### Base Sepolia
- VRF Coordinator: `0xC5E5F5C84243FDdC33c4ed5A0B3697D7D8535Cc9`
- Key Hash: `0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71`

---

## Seguridad

- El contrato usa `ReentrancyGuard` de OpenZeppelin
- Validaciones de entrada en todas las funciones
- Solo el owner puede retirar fees y cambiar configuración
- Fee máximo limitado a 10% hardcodeado en el contrato

---

## Licencia

MIT
