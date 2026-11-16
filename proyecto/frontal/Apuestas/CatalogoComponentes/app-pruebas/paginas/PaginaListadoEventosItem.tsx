// El item solo, con cada uno de los cuatro eventos de prueba: cada uno es un caso distinto.
import { ListadoEventosItem } from "../../src/ListadoEventosItem/ListadoEventosItem";
import { EVENTOS } from "../../dobles/datos";
import estilos from "./Pagina.module.css";
import { usePaginaListadoEventosItem } from "./usePaginaListadoEventosItem";

const CASOS = [
  "Por empezar",
  "En directo, con cuotas que suben y bajan",
  "Interrumpido, con el mercado suspendido",
  "Sin mercado principal",
];

export function PaginaListadoEventosItem() {
  const pagina = usePaginaListadoEventosItem();

  return (
    <>
      <h2 className={estilos.titulo}>ListadoEventosItem</h2>
      <p className={estilos.explicacion}>
        Un evento con su mercado principal. Al pulsarlo avisa con su id.
      </p>
      {EVENTOS.map((evento, i) => (
        <section key={evento.id}>
          <h3 className={estilos.caso}>{CASOS[i]}</h3>
          <ListadoEventosItem evento={evento} onAbrir={pagina.onAbrir} />
        </section>
      ))}
      <p className={estilos.ultimo}>
        onAbrir: {pagina.abierto ?? "(todavía nada)"}
      </p>
    </>
  );
}
