# Apuestas deportivas

Proyecto del curso *Arquitectura frontend profesional con TypeScript, React y
Electron*. Este repo no tiene código propio: junta, como submódulos de git, los
repos de cada componente, para poder clonarlo todo de una vez y abrirlo junto.

Cada componente vive en su propio repo, con su versión, sus pruebas y sus
pipelines. En el CI se consumen entre ellos como paquetes NuGet con versión
fija. En local, con este repo clonado, cada componente usa el código de sus
vecinos directamente, sin publicar nada: lo explica el README de cada uno
(*Trabajar en local con todo el proyecto*).

## Componentes

| Carpeta | Repo | Qué es |
|---|---|---|
| `backend/Comun/Validacion` | [`comun-validacion`](https://gitlab.ivanosuna.com/apuestas-deportivas/comun-validacion) | Validación inyectable por DI, para cualquier capa y dominio. |
| `backend/Apuestas/Invariantes` | [`apuestas-invariantes`](https://gitlab.ivanosuna.com/apuestas-deportivas/apuestas-invariantes) | Anotaciones de validación de los campos del dominio. |
| `backend/Apuestas/Dominio` | [`apuestas-dominio`](https://gitlab.ivanosuna.com/apuestas-deportivas/apuestas-dominio) | Modelos del dominio. |
| `frontal/` | | Los frontales React y Electron, todavía por crear. |

`backend/ApuestasDeportivas.slnx` abre todos los proyectos juntos en el IDE.

## Clonar

```bash
git clone --recurse-submodules https://gitlab.ivanosuna.com/apuestas-deportivas/proyecto.git
```

Cada submódulo sigue la rama `main` de su repo (ver `.gitmodules`), pero git
guarda un commit concreto, no la rama. Para traer lo último de `main` de todos:

```bash
git submodule update --remote
git commit -am "Submódulos al último main"
```

Para trabajar en un componente, entra en su carpeta y cambia a `dev`: un
submódulo recién actualizado queda en un commit suelto, no en una rama.

```bash
cd backend/Comun/Validacion
git switch dev
```

Con todo clonado desde aquí no hace falta ninguna credencial: se usan los
proyectos vecinos. Solo hace falta para compilar como el CI
(`-p:UsarFuentesLocales=false`) o un componente clonado suelto.
