"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { XCircle, Camera, RefreshCw, CameraOff, Smartphone, AlertTriangle } from "lucide-react"

interface BarcodeScannerProps {
  onDetected: (code: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isFrontCamera, setIsFrontCamera] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied" | "unsupported">("prompt")
  const [isIOSUnsupported, setIsIOSUnsupported] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const readerRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)

  // Detectar iOS y verificar compatibilidad
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

    // Verificar si estamos en iOS y si mediaDevices está disponible
    if (isIOS) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("Dispositivo iOS detectado sin soporte para mediaDevices")
        setIsIOSUnsupported(true)
        setCameraPermission("unsupported")
      } else {
        console.log("Dispositivo iOS detectado con posible soporte para mediaDevices")
      }
    }

    // Verificar el estado de los permisos si el navegador lo soporta
    if (navigator.permissions && !isIOSUnsupported) {
      try {
        navigator.permissions
          .query({ name: "camera" as PermissionName })
          .then((result) => {
            setCameraPermission(result.state as "prompt" | "granted" | "denied")

            // Escuchar cambios en el estado del permiso
            result.addEventListener("change", () => {
              setCameraPermission(result.state as "prompt" | "granted" | "denied")
            })
          })
          .catch((error) => {
            console.warn("No se pudo verificar el estado de los permisos:", error)
          })
      } catch (error) {
        console.warn("Error al consultar permisos:", error)
      }
    }
  }, [])

  // Función para limpiar recursos de la cámara
  const cleanupCamera = () => {
    // Detener el lector de ZXing si existe
    if (controlsRef.current) {
      try {
        controlsRef.current.stop()
        controlsRef.current = null
      } catch (error) {
        console.error("Error stopping ZXing reader:", error)
      }
    }

    // Detener la transmisión de la cámara si existe
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log("Camera track stopped:", track.id)
      })
      mediaStreamRef.current = null
    }

    // Limpiar el video
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Función para cambiar entre cámara frontal y trasera
  const toggleCamera = () => {
    const newIsFrontCamera = !isFrontCamera
    setIsFrontCamera(newIsFrontCamera)

    // Reiniciar la cámara con la nueva configuración
    cleanupCamera()
    initializeScanner(newIsFrontCamera)
  }

  // Función para solicitar permisos y inicializar el escáner
  const requestPermissionAndInitialize = async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage("Tu navegador no soporta acceso a la cámara. Intenta con Chrome, Firefox o Safari actualizado.")
        setHasError(true)
        setIsLoading(false)
        setCameraPermission("unsupported")
        return
      }

      // Solicitar acceso a la cámara explícitamente
      try {
        // Solicitar solo acceso a la cámara primero (sin configuración específica)
        // Esto es importante para que el navegador muestre el diálogo de permisos
        await navigator.mediaDevices.getUserMedia({ video: true })

        // Si llegamos aquí, el permiso fue concedido
        setCameraPermission("granted")

        // Ahora inicializar el escáner con la configuración completa
        await initializeScanner(isFrontCamera)
      } catch (error: any) {
        console.error("Error al solicitar permisos de cámara:", error)

        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          setCameraPermission("denied")
          setErrorMessage(
            "Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.",
          )
        } else {
          setErrorMessage(`Error al acceder a la cámara: ${error.message || "Error desconocido"}`)
        }

        setHasError(true)
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Error general al solicitar permisos:", error)
      setErrorMessage(`Error: ${error.message || "Error desconocido"}`)
      setHasError(true)
      setIsLoading(false)
    }
  }

  // Función para inicializar el escáner
  const initializeScanner = async (useFrontCamera = false) => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      // Importar ZXing
      const { BrowserMultiFormatReader } = await import("@zxing/browser")

      // Crear una instancia del lector con configuración mejorada
      const hints = new Map()

      // Intentar importar las constantes necesarias
      try {
        const ZXing = await import("@zxing/library")
        if (ZXing.DecodeHintType && ZXing.BarcodeFormat) {
          // Configurar para detectar más tipos de códigos
          hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
            ZXing.BarcodeFormat.EAN_13,
            ZXing.BarcodeFormat.EAN_8,
            ZXing.BarcodeFormat.UPC_A,
            ZXing.BarcodeFormat.UPC_E,
            ZXing.BarcodeFormat.CODE_39,
            ZXing.BarcodeFormat.CODE_128,
            ZXing.BarcodeFormat.ITF,
            ZXing.BarcodeFormat.QR_CODE,
            ZXing.BarcodeFormat.DATA_MATRIX,
            ZXing.BarcodeFormat.PDF_417,
            ZXing.BarcodeFormat.AZTEC,
          ])
          // Intentar más agresivamente encontrar códigos
          hints.set(ZXing.DecodeHintType.TRY_HARDER, true)
          // Permitir rotaciones
          hints.set(ZXing.DecodeHintType.TRY_HARDER_WITHOUT_ROTATION, false)
          // Ser más permisivo con códigos de barras de baja calidad
          hints.set(ZXing.DecodeHintType.PURE_BARCODE, false)
        }
      } catch (error) {
        console.warn("No se pudieron cargar las constantes de ZXing, usando configuración predeterminada")
      }

      // Crear el lector con o sin hints dependiendo de si pudimos cargarlos
      readerRef.current = hints.size > 0 ? new BrowserMultiFormatReader(hints) : new BrowserMultiFormatReader()

      // Configurar las restricciones de video
      const videoConstraints = {
        video: {
          facingMode: useFrontCamera ? "user" : "environment",
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { ideal: 30 },
        },
      }

      // Iniciar el escaneo continuo
      if (!videoRef.current) {
        throw new Error("Video reference not available")
      }

      controlsRef.current = await readerRef.current.decodeFromConstraints(
        videoConstraints,
        videoRef.current,
        (result: any, error: any) => {
          if (result) {
            // Código detectado
            const barcode = result.getText()
            console.log("Código detectado:", barcode)

            // Reproducir un sonido de éxito
            playSuccessSound()

            // Hacer vibrar el dispositivo si es compatible
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100])
            }

            // Notificar al componente padre
            onDetected(barcode)
          }

          if (error && !(error instanceof TypeError)) {
            // Solo registrar errores que no sean de tipo (son comunes durante el escaneo)
            if (error.message !== "No MultiFormat Readers were able to detect the code.") {
              console.error("Error de escaneo:", error)
            }
          }
        },
      )

      // Guardar referencia al stream para limpieza posterior
      if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
        mediaStreamRef.current = videoRef.current.srcObject
      }

      setIsLoading(false)
    } catch (error: any) {
      console.error("Error in initializeScanner:", error)
      setErrorMessage("Error al inicializar el escáner: " + error.message)
      setHasError(true)
      setIsLoading(false)
    }
  }

  // Función para reproducir un sonido de éxito
  const playSuccessSound = () => {
    try {
      const beep = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...")
      beep.volume = 0.5
      beep.play().catch((e) => console.log("Audio play failed:", e))
    } catch (e) {
      console.log("Audio error:", e)
    }
  }

  const handleClose = () => {
    cleanupCamera()
    onClose()
  }

  // Renderizar vista específica para iOS no compatible
  const renderIOSUnsupportedView = () => {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Safari no soporta el escáner</h3>
        <p className="text-gray-500 mb-4">
          Tu versión de Safari no soporta el acceso a la cámara necesario para el escáner de códigos de barras.
        </p>
        <div className="space-y-4 w-full">
          <div className="bg-gray-100 p-4 rounded-md text-left">
            <h4 className="font-medium mb-2">Alternativas:</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Usa Chrome o Firefox en tu dispositivo iOS</li>
              <li>Actualiza a la última versión de iOS y Safari</li>
              <li>Ingresa el código manualmente</li>
            </ul>
          </div>
          <Button variant="outline" onClick={handleClose} className="w-full">
            <CameraOff className="mr-2 h-4 w-4" />
            Cerrar
          </Button>
        </div>
      </div>
    )
  }

  // Renderizar diferentes vistas según el estado de los permisos
  const renderContent = () => {
    // Vista específica para iOS no compatible
    if (isIOSUnsupported) {
      return renderIOSUnsupportedView()
    }

    // Si el permiso está denegado
    if (cameraPermission === "denied") {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <XCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Permiso de cámara denegado</h3>
          <p className="text-gray-500 mb-4">
            Para escanear códigos de barras, debes permitir el acceso a la cámara en la configuración de tu navegador.
          </p>
          <div className="space-y-2 w-full">
            <Button onClick={requestPermissionAndInitialize} className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Solicitar permiso nuevamente
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full">
              <CameraOff className="mr-2 h-4 w-4" />
              Cerrar
            </Button>
          </div>
        </div>
      )
    }

    // Si el navegador no soporta la cámara
    if (cameraPermission === "unsupported") {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <XCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Cámara no soportada</h3>
          <p className="text-gray-500 mb-4">
            Tu navegador no soporta acceso a la cámara. Intenta con Chrome, Firefox o Safari actualizados.
          </p>
          <Button variant="outline" onClick={handleClose} className="w-full">
            <CameraOff className="mr-2 h-4 w-4" />
            Cerrar
          </Button>
        </div>
      )
    }

    // Si el permiso aún no ha sido concedido o si necesitamos solicitarlo
    if (cameraPermission === "prompt" && !mediaStreamRef.current) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <Smartphone className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Acceso a la cámara</h3>
          <p className="text-gray-500 mb-4">
            Para escanear códigos de barras, necesitamos acceder a la cámara de tu dispositivo.
          </p>
          <div className="space-y-2 w-full">
            <Button onClick={requestPermissionAndInitialize} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Iniciando cámara...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Permitir acceso a la cámara
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full">
              <CameraOff className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      )
    }

    // Vista normal del escáner cuando el permiso está concedido y la cámara está activa
    return (
      <>
        <div className="relative bg-black rounded-md overflow-hidden aspect-video">
          {/* Video element for camera feed */}
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />

          {/* Scanner overlay with targeting guide */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/3 border-2 border-green-500 rounded-md"></div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* Error message */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-30 p-4">
              <XCircle className="h-12 w-12 text-red-500 mb-2" />
              <p className="text-white text-center">
                {errorMessage || "No se pudo acceder a la cámara. Verifica los permisos del navegador."}
              </p>
              <Button variant="outline" onClick={() => initializeScanner(isFrontCamera)} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}
        </div>

        {/* Controles de cámara */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={toggleCamera} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            {isFrontCamera ? "Usar cámara trasera" : "Usar cámara frontal"}
          </Button>

          <Button variant="default" onClick={handleClose} className="w-full">
            <CameraOff className="mr-2 h-4 w-4" />
            Cerrar Cámara
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-2">
          Apunta la cámara al código de barras para escanear automáticamente.
        </p>
      </>
    )
  }

  return <div className="space-y-3 md:max-w-md md:mx-auto">{renderContent()}</div>
}
