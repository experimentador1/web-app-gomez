// utils/citasAB.ts
// Implementación de las 3 corridas de Citas A/B basadas en Dashboard_articulos.py

import type { VisJSData, VisNode } from "../types/grafo";

export interface ReporteCitasAB {
  corrida1: {
    total_vertices: number;
    pintados_azul: number;
    omitidos_sin_autores: number;
  };
  corrida2: {
    aristas_evaluadas: number;
    pares_B: number;
    vertices_amarillo: number;
    muestras: Array<{ origen: string; destino: string }>;
  };
  corrida3: {
    raices_ab: number;
    vertices_verde: number;
  };
  resumen: {
    tipo_A: number;  // azules + verdes
    tipo_B: number;  // amarillos
    tipo_AB: number; // verdes (raíces)
    tipo_S: number;  // rojos (sin autores)
    total: number;
  };
  grafo: VisJSData;
}

// Normalizar autores a un Set de strings en minúsculas
function autoresASet(authors: unknown[]): Set<string> {
  const result = new Set<string>();
  if (!authors || !Array.isArray(authors)) return result;
  
  for (const autor of authors) {
    if (typeof autor === "string" && autor.trim()) {
      result.add(autor.toLowerCase().trim());
    } else if (autor && typeof autor === "object" && "name" in autor) {
      const name = (autor as { name?: string }).name;
      if (name && typeof name === "string") {
        result.add(name.toLowerCase().trim());
      }
    }
  }
  return result;
}

// Obtener autores de un nodo
function getAutores(node: VisNode): Set<string> {
  const authors = node.data?.authors || [];
  return autoresASet(authors);
}

/**
 * Ejecuta las 3 corridas del algoritmo Citas A/B
 * Basado en Dashboard_articulos.py - cargar_grafo_citas_ab_desde_api
 */
export function ejecutarCitasAB(grafoOriginal: VisJSData): ReporteCitasAB {
  // Clonar el grafo para no modificar el original
  const grafo: VisJSData = {
    nodes: grafoOriginal.nodes.map(n => ({ ...n, data: { ...n.data } })),
    edges: grafoOriginal.edges.map(e => ({ ...e })),
  };

  // Estructura de métricas
  const reporte: ReporteCitasAB = {
    corrida1: { total_vertices: 0, pintados_azul: 0, omitidos_sin_autores: 0 },
    corrida2: { aristas_evaluadas: 0, pares_B: 0, vertices_amarillo: 0, muestras: [] },
    corrida3: { raices_ab: 0, vertices_verde: 0 },
    resumen: { tipo_A: 0, tipo_B: 0, tipo_AB: 0, tipo_S: 0, total: 0 },
    grafo: grafo,
  };

  // Mapa de nodos por ID para acceso rápido
  const nodesMap = new Map<string, VisNode>();
  grafo.nodes.forEach(n => nodesMap.set(n.id, n));

  // Mapa de tipo por nodo
  const tipoMap = new Map<string, string>();

  // ========================================
  // CORRIDA 1: Clasificación inicial (Azul)
  // ========================================
  reporte.corrida1.total_vertices = grafo.nodes.length;

  for (const node of grafo.nodes) {
    const autores = getAutores(node);
    if (autores.size > 0) {
      // Tiene autores → Azul, tipo A
      node.color = "#3B82F6"; // blue-500
      node.data.tipo = "A";
      tipoMap.set(node.id, "A");
      reporte.corrida1.pintados_azul++;
    } else {
      // Sin autores → Rojo, tipo S
      node.color = "#EF4444"; // red-500
      node.data.tipo = "S";
      tipoMap.set(node.id, "S");
      reporte.corrida1.omitidos_sin_autores++;
    }
  }

  // ========================================
  // CORRIDA 2: Detección de auto-citación (Amarillo = B)
  // ========================================
  const verticesPintadosB = new Set<string>();
  const muestras: Array<{ origen: string; destino: string }> = [];

  // Crear mapa de adyacencias desde edges
  const adyacencias = new Map<string, string[]>();
  for (const edge of grafo.edges) {
    const origen = edge.from;
    const destino = edge.to;
    if (!adyacencias.has(origen)) {
      adyacencias.set(origen, []);
    }
    adyacencias.get(origen)!.push(destino);
  }

  // Evaluar cada arista
  for (const [origen, destinos] of adyacencias.entries()) {
    const nodeOrigen = nodesMap.get(origen);
    if (!nodeOrigen) continue;
    
    const autOrigen = getAutores(nodeOrigen);
    if (autOrigen.size === 0) continue; // Ignorar vértices sin autores

    for (const destino of destinos) {
      const nodeDestino = nodesMap.get(destino);
      if (!nodeDestino) continue;
      
      const autDestino = getAutores(nodeDestino);
      if (autDestino.size === 0) continue; // Ignorar destino sin autores

      reporte.corrida2.aristas_evaluadas++;

      // Verificar intersección de autores
      const hayInterseccion = [...autOrigen].some(a => autDestino.has(a));

      if (hayInterseccion) {
        // Auto-citación detectada → Amarillo, tipo B
        nodeOrigen.color = "#EAB308"; // yellow-500
        nodeOrigen.data.tipo = "B";
        tipoMap.set(origen, "B");

        nodeDestino.color = "#EAB308"; // yellow-500
        nodeDestino.data.tipo = "B";
        tipoMap.set(destino, "B");

        verticesPintadosB.add(origen);
        verticesPintadosB.add(destino);
        reporte.corrida2.pares_B++;

        if (muestras.length < 12) {
          muestras.push({ origen, destino });
        }
      }
    }
  }

  reporte.corrida2.vertices_amarillo = verticesPintadosB.size;
  reporte.corrida2.muestras = muestras;

  // ========================================
  // CORRIDA 3: Raíces de cadenas AB (Verde)
  // ========================================
  // Dentro del subgrafo de vértices B (amarillos),
  // identificar vértices que NO tienen salidas hacia otros B
  
  const amarillos = new Set<string>();
  for (const node of grafo.nodes) {
    if (tipoMap.get(node.id) === "B") {
      amarillos.add(node.id);
    }
  }

  if (amarillos.size > 0) {
    // Calcular OUT-degree dentro del subgrafo amarillo
    const outdegAmarillo = new Map<string, number>();
    for (const n of amarillos) {
      outdegAmarillo.set(n, 0);
    }

    for (const [origen, destinos] of adyacencias.entries()) {
      if (!amarillos.has(origen)) continue;
      for (const destino of destinos) {
        if (amarillos.has(destino)) {
          outdegAmarillo.set(origen, (outdegAmarillo.get(origen) || 0) + 1);
        }
      }
    }

    // Raíces = vértices B sin salidas a otros B
    const raices: string[] = [];
    for (const [n, deg] of outdegAmarillo.entries()) {
      if (deg === 0) {
        raices.push(n);
      }
    }

    // Marcar como AB (verde)
    for (const n of raices) {
      const node = nodesMap.get(n);
      if (node) {
        node.color = "#22C55E"; // green-500
        node.data.tipo = "AB";
        tipoMap.set(n, "AB");
      }
    }

    reporte.corrida3.raices_ab = raices.length;
    reporte.corrida3.vertices_verde = raices.length;
  }

  // ========================================
  // RESUMEN FINAL
  // ========================================
  let azules = 0, verdes = 0, amarillos_count = 0, rojos = 0;

  for (const node of grafo.nodes) {
    const color = node.color?.toLowerCase() || "";
    if (color.includes("3b82f6") || color === "blue") {
      azules++;
    } else if (color.includes("22c55e") || color === "green") {
      verdes++;
    } else if (color.includes("eab308") || color === "yellow") {
      amarillos_count++;
    } else if (color.includes("ef4444") || color === "red") {
      rojos++;
    }
  }

  // Según Dashboard: 
  // tipo_A = azules + verdes (citas independientes + raíces)
  // tipo_B = amarillos (auto-citación)
  // tipo_AB = verdes (raíces de cadenas)
  // tipo_S = rojos (sin autores)
  reporte.resumen = {
    tipo_A: azules + verdes,
    tipo_B: amarillos_count,
    tipo_AB: verdes,
    tipo_S: rojos,
    total: grafo.nodes.length,
  };

  return reporte;
}
