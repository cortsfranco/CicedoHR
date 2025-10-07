import React from 'react';

// Reusable components for styling the documentation
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-12">
        <h2 className="text-3xl font-bold text-slate-800 border-b-2 border-indigo-200 pb-2 mb-6">{title}</h2>
        <div className="space-y-4 text-slate-700 leading-relaxed">
            {children}
        </div>
    </section>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-8">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">{title}</h3>
        <div className="space-y-3 pl-4 border-l-4 border-slate-200">{children}</div>
    </div>
);

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-100 p-3 my-2 rounded-md text-sm text-slate-800 overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const Documentation: React.FC = () => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">Manual de Usuario: CaicedoHR</h1>
            <p className="text-lg text-slate-600 mb-10">Una guía completa para maximizar el uso y la eficiencia del panel de control de RRHH.</p>

            <Section title="1. Introducción">
                <p>Bienvenida a <strong>CaicedoHR</strong>, tu centro de control inteligente para la gestión de Recursos Humanos. Esta herramienta está diseñada para transformar datos complejos en visualizaciones claras y análisis estratégicos, permitiéndote tomar decisiones informadas y eficientes.</p>
                <p>Este manual te guiará a través de cada sección, explicando sus funciones y cómo puedes aprovecharlas al máximo.</p>
                 <SubSection title="Persistencia de Datos">
                    <p>Todos los cambios que realices (añadir, editar o eliminar colaboradores y registros) se guardan automáticamente en el almacenamiento local de tu navegador (<code>localStorage</code>). Esto significa que tu información no se perderá si cierras o refrescas la página. Ten en cuenta que estos datos son locales y no se sincronizan entre diferentes navegadores o dispositivos.</p>
                </SubSection>
            </Section>

            <Section title="2. Panel Principal">
                <p>Esta es la vista de resumen que te ofrece una instantánea del estado de RRHH en la organización a través de indicadores clave y gráficos.</p>
                <SubSection title="Indicadores Clave (KPIs)">
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Total Empleados:</strong> Muestra el número de colaboradores con estado "Activo".</li>
                        <li><strong>Ingresos/Egresos/Ausencias:</strong> El conteo total de cada tipo de registro en el sistema.</li>
                        <li><strong>Costos Totales:</strong> La suma de todos los costos asociados a los registros (ingresos, egresos, sanciones con costo, etc.).</li>
                    </ul>
                </SubSection>
                <SubSection title="Gráficos">
                   <p><strong>Actividad Mensual:</strong> Un gráfico de barras que compara los ingresos (nuevas contrataciones) y egresos (bajas) mes a mes. Ideal para visualizar tendencias de contratación y rotación.</p>
                   <p><strong>Sanciones por Tipo:</strong> Un gráfico circular que muestra la distribución de los diferentes tipos de sanciones aplicadas, permitiéndote identificar las más frecuentes.</p>
                </SubSection>
            </Section>

            <Section title="3. Análisis de Impacto">
                <p>Esta es la sección más potente para el análisis estratégico. Traduce las métricas de RRHH en impacto de negocio tangible, ayudándote a responder la pregunta: <em>"¿Y esto, qué significa para la empresa?"</em>.</p>
                 <SubSection title="Filtros Interactivos">
                   <p>En la parte superior, encontrarás filtros para acotar los datos que se analizan en toda la sección:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Rango de Fechas:</strong> Puedes seleccionar rangos predefinidos (Este Año, Mes Anterior, etc.) o un rango personalizado para un análisis preciso. Por defecto, la vista carga todos tus datos históricos.</li>
                        <li><strong>Unidad de Gestión (UG) y Tipo de Contrato:</strong> Permiten segmentar los datos para analizar grupos específicos de colaboradores.</li>
                    </ul>
                </SubSection>
                <SubSection title="KPIs de Impacto">
                   <p><strong>Tasa de Rotación:</strong> Calcula el porcentaje de empleados que han dejado la empresa en el período seleccionado.</p>
                   <p><strong>Costo Directo de Rotación:</strong> Muestra el costo total de las desvinculaciones y lo desglosa por los motivos de egreso más costosos.</p>
                   <p><strong>Costo Estimado de Ausentismo:</strong> Calcula el impacto financiero de las ausencias. Puedes ingresar un <strong>salario diario promedio</strong> en el campo de texto para ajustar el cálculo y obtener una estimación más precisa.</p>
                </SubSection>
                <SubSection title="Gráficos de Análisis">
                    <p><strong>Correlación: Egresos vs. Sanciones:</strong> Este gráfico de doble eje es crucial para detectar si un aumento en las sanciones (línea) podría estar relacionado con un aumento en las bajas (barras) en los meses siguientes.</p>
                    <p><strong>Costo por Motivo de Egreso:</strong> El gráfico circular muestra qué motivos de egreso son los más costosos. La tabla inferior detalla cada motivo con su cantidad y costo total, y puedes ordenarla haciendo clic en las cabeceras "Cantidad" o "Costo Total".</p>
                    <p><strong>Costo por Sanción:</strong> Un gráfico de barras apiladas que visualiza el costo asociado a cada tipo de sanción, mes a mes.</p>
                     <p><strong>Mensaje "No hay datos":</strong> Si un gráfico aparece vacío, mostrará un mensaje indicando que no hay información para los filtros seleccionados. Esto confirma que no hubo actividad, en lugar de un error del sistema.</p>
                </SubSection>
            </Section>

            <Section title="4. Gestión de Colaboradores">
                 <p>Aquí puedes administrar toda la información de los empleados de la empresa.</p>
                 <SubSection title="Barra de Herramientas y Filtros">
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Buscar:</strong> Ingresa un nombre, DNI o legajo para encontrar rápidamente a un colaborador.</li>
                        <li><strong>Filtrar por Estado:</strong> Selecciona "Activo" o "Inactivo" para ver solo los colaboradores que cumplen con ese criterio.</li>
                        <li><strong>Importar y Exportar:</strong> Permite cargar masivamente colaboradores desde un archivo CSV o descargar la lista actual.</li>
                        <li><strong>Añadir Colaborador:</strong> Abre un formulario para ingresar un nuevo empleado.</li>
                    </ul>
                 </SubSection>
                 <SubSection title="Selección Múltiple y Acciones en Lote">
                    <p>Puedes seleccionar varias filas usando las casillas de verificación. Al hacerlo, aparecerá un botón de <strong>"Eliminar Seleccionados"</strong>, permitiéndote realizar acciones en bloque. Eliminar un colaborador también eliminará todos sus registros asociados (ingresos, sanciones, etc.).</p>
                 </SubSection>
                 <SubSection title="Importación de Datos (CSV)">
                    <p>Para importar colaboradores, tu archivo CSV debe contener las columnas correspondientes a los campos del formulario (ej: `name`, `dni`, `legajo`, `hireDate`, `status`, etc.). El sistema validará que el DNI y el Legajo no existan previamente para evitar duplicados.</p>
                 </SubSection>
            </Section>

            <Section title="5. Gestión de Registros">
                <p>Esta sección centraliza todos los eventos de RRHH: egresos, sanciones y ausencias.</p>
                <SubSection title="Filtros y Acciones">
                    <p>Utiliza los menús desplegables para filtrar los registros por <strong>Tipo</strong> (ej: Sanción) o por <strong>Colaborador</strong>. Al igual que en la sección de colaboradores, puedes importar, exportar y añadir nuevos registros.</p>
                    <p>Al añadir un registro de <strong>Egreso</strong>, el estado del colaborador correspondiente se actualizará automáticamente a "Inactivo".</p>
                </SubSection>
                 <SubSection title="Importación de Datos (CSV)">
                    <p>El archivo CSV para registros debe incluir columnas como `date`, `collaboratorId`, `type`, `cost` y `details`. El campo `details` es el más importante y debe ser un objeto JSON válido con la estructura correcta según el tipo de registro.</p>
                    <p>Ejemplo para el campo `details` en el CSV:</p>
                    <CodeBlock>{`"{""reason"":""Renuncia""}"`}</CodeBlock>
                    <CodeBlock>{`"{""type"":""Apercibimiento escrito"",""reason"":""Llegadas tarde""}"`}</CodeBlock>
                 </SubSection>
            </Section>

            <Section title="6. Asistente IA">
                <p>Tu analista de datos personal. Puedes hacerle preguntas en lenguaje natural sobre la información contenida en el sistema, y te proporcionará respuestas basadas en los datos actuales.</p>
                <SubSection title="¿Cómo funciona?">
                    <p>El asistente tiene acceso en tiempo real a las listas de colaboradores y registros. Cuando haces una pregunta, cruza esta información para darte una respuesta coherente.</p>
                </SubSection>
                <SubSection title="Ejemplos de Preguntas">
                    <ul className="list-disc list-inside space-y-2">
                        <li>"¿Cuál fue el costo total de las desvinculaciones por renuncia?"</li>
                        <li>"¿Cuántas ausencias tuvo Ana García este año?"</li>
                        <li>"Lista todas las sanciones aplicadas en la UG2-VISTA MENDOZA."</li>
                        <li>"¿Quién es el colaborador con el legajo 1003?"</li>
                    </ul>
                </SubSection>
            </Section>

        </div>
    );
};

export default Documentation;