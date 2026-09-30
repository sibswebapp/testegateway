const fs = require("fs");
const path = require("path");


// ============================================================
// CONFIGURAÇÃO
// ============================================================

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 8002;

const prefix = HOST === "127.0.0.1"
    ? ""
    : "/SimuladorSIBS";

const API_URL =
    `http://${HOST}:${PORT}${prefix}/api/validar-clientid_script`;


// 10 pedidos por execução
const REQUESTS_PER_RUN = 10;


// TESTE: 1 hora
const INTERVAL = 60 * 60 * 1000;

// Para testar: 10 segundos
// const INTERVAL = 10 * 1000;


// ============================================================
// PERÍODO DO MONITOR
// ============================================================

// PRODUÇÃO: 2 dias
const PERIOD_DURATION = 2 * 24 * 60 * 60 * 1000;

// TESTE: 1 minuto
// const PERIOD_DURATION = 60 * 1000;


// ============================================================
// DADOS UTILIZADOS PARA TESTAR A API
// ============================================================

const TEST_DATA = {
    clientId: "dd4348ea-e240-4356-bf06-6a4f294c1077",
    token: "0276b80f950fb446c6addaccd121abfbbb.eyJlIjoiMjA5MjY0NTgyMjIwMCIsInJvbGVzIjoiU1BHX01BTkFHRVIiLCJ0b2tlbkFwcERhdGEiOiJ7XCJtY1wiOlwiNTA2OTMxXCIsXCJ0Y1wiOlwiOTYxNjdcIn0iLCJpIjoiMTc3NzAyNjYyMjIwMCIsImlzIjoiaHR0cHM6Ly9xbHkuc2l0ZTEuc3NvLnN5cy5zaWJzLnB0L2F1dGgvcmVhbG1zL1FMWS5NRVJDSC5QT1JUMSIsInR5cCI6IkJlYXJlciIsImlkIjoiRGEwR1puNE04UTAwYmI0MjkyMjUzNzQ1NDM4OTkwMTY4ZjZjOTQwOWUxIn0=.9305920d1f909efaf8ae55f006c249368810c0b52da90826a520b8f0ebeba24f2c3ac903516b56621a5c17cf0a72b962f8f3a72700520ac774b132795268a313",
    terminalID: "96167"
};


// ============================================================
// FICHEIROS
// ============================================================

const DATA_DIR = path.join(
    __dirname,
    "data"
);

const RESULTS_FILE = path.join(
    DATA_DIR,
    "api-monitor.json"
);

const PERIOD_FILE = path.join(
    DATA_DIR,
    "monitor-period.json"
);

const REPORTS_DIR = path.join(
    DATA_DIR,
    "reports"
);


// ============================================================
// CRIAR PASTAS
// ============================================================

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
        recursive: true
    });
}

if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, {
        recursive: true
    });
}


// ============================================================
// LER HISTÓRICO
// ============================================================

function loadResults() {

    try {

        if (!fs.existsSync(RESULTS_FILE)) {
            return [];
        }

        return JSON.parse(
            fs.readFileSync(
                RESULTS_FILE,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "Erro ao ler histórico:",
            error
        );

        return [];
    }
}


// ============================================================
// GUARDAR HISTÓRICO
// ============================================================

function saveResults(results) {

    fs.writeFileSync(
        RESULTS_FILE,
        JSON.stringify(
            results,
            null,
            4
        ),
        "utf8"
    );
}


// ============================================================
// LER PERÍODO
// ============================================================

function loadPeriod() {

    try {

        if (!fs.existsSync(PERIOD_FILE)) {

            const period = {
                periodStart: new Date().toISOString()
            };

            fs.writeFileSync(
                PERIOD_FILE,
                JSON.stringify(
                    period,
                    null,
                    4
                ),
                "utf8"
            );

            console.log("");
            console.log(
                "Novo período iniciado:"
            );

            console.log(
                period.periodStart
            );

            return period;
        }


        return JSON.parse(
            fs.readFileSync(
                PERIOD_FILE,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "Erro ao ler período:",
            error
        );

        const period = {
            periodStart: new Date().toISOString()
        };

        fs.writeFileSync(
            PERIOD_FILE,
            JSON.stringify(
                period,
                null,
                4
            ),
            "utf8"
        );

        return period;
    }
}


// ============================================================
// GUARDAR PERÍODO
// ============================================================

function savePeriod(period) {

    fs.writeFileSync(
        PERIOD_FILE,
        JSON.stringify(
            period,
            null,
            4
        ),
        "utf8"
    );
}


// ============================================================
// CHAMAR API
// ============================================================

async function chamarAPI() {

    const start = Date.now();

    try {

        const response = await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(TEST_DATA)
            }
        );

        const duration =
            Date.now() - start;


        // ====================================================
        // LER RESPOSTA
        // ====================================================

        const responseText =
            await response.text();

        let data;


        try {

            data =
                JSON.parse(responseText);

        } catch (e) {

            console.error("");
            console.error(
                "❌ ERRO API"
            );

            console.error(
                "HTTP:",
                response.status
            );

            console.error(
                "Resposta:",
                responseText
            );


            return {

                status: "error",

                httpStatus:
                    response.status,

                duration,

                error:
                    responseText
            };
        }


        const status =
            data?.returnStatus;


        // ====================================================
        // VALIDAR SUCESSO
        // ====================================================

        const sucesso =
            (
                status?.statusCode === "000" &&
                status?.statusMsg === "Success"
            ) ||
            status?.statusCode === "T9999";


        // ====================================================
        // SUCESSO
        // ====================================================

        if (sucesso) {

            console.log(
                `✅ API OK | HTTP ${response.status} | ${duration} ms`
            );


            return {

                status: "success",

                httpStatus:
                    response.status,

                duration,

                returnStatus:
                    status
            };
        }


        // ====================================================
        // ERRO DEVOLVIDO PELA API
        // ====================================================

        console.error("");

        console.error(
            "❌ ERRO DEVOLVIDO PELA API"
        );

        console.error(
            "--------------------------------"
        );

        console.error(
            "HTTP Status:",
            response.status
        );

        console.error(
            "Status Code:",
            status?.statusCode
        );

        console.error(
            "Status Msg:",
            status?.statusMsg
        );

        console.error(
            "Status Description:",
            status?.statusDescription
        );

        console.error(
            "--------------------------------"
        );

        console.error(
            "Resposta completa da API:"
        );

        console.error(
            JSON.stringify(
                data,
                null,
                4
            )
        );

        console.error(
            "--------------------------------"
        );


        return {

            status: "error",

            httpStatus:
                response.status,

            duration,

            returnStatus:
                status,

            error: status

                ? `${status.statusCode} - ${status.statusMsg}: ${status.statusDescription || ""}`

                : JSON.stringify(data)
        };


    } catch (error) {


        // ====================================================
        // ERRO DE COMUNICAÇÃO
        // ====================================================

        const duration =
            Date.now() - start;


        console.error("");

        console.error(
            "❌ ERRO DE COMUNICAÇÃO COM A API"
        );

        console.error(
            "--------------------------------"
        );

        console.error(
            "Mensagem:",
            error.message
        );

        console.error(
            "Nome:",
            error.name
        );

        console.error(
            "URL:",
            API_URL
        );

        console.error(
            "--------------------------------"
        );


        return {

            status: "error",

            httpStatus: null,

            duration,

            error:
                error.message
        };
    }
}


// ============================================================
// ARQUIVAR PERÍODO E FAZER RESET
// ============================================================

function archiveAndReset(
    history,
    period
) {

    const now =
        new Date();


    // ========================================================
    // CALCULAR TOTAIS
    // ========================================================

    const totalRequests =
        history.reduce(
            (total, run) =>
                total + run.total,
            0
        );


    const totalSuccess =
        history.reduce(
            (total, run) =>
                total + run.success,
            0
        );


    const totalErrors =
        history.reduce(
            (total, run) =>
                total + run.errors,
            0
        );


    const percentage =
        totalRequests > 0

            ? (
                totalSuccess /
                totalRequests
            ) * 100

            : 0;


    // ========================================================
    // CRIAR RELATÓRIO
    // ========================================================

    const report = {

        period: {

            start:
                period.periodStart,

            end:
                now.toISOString()
        },


        summary: {

            totalRuns:
                history.length,

            totalRequests,

            success:
                totalSuccess,

            errors:
                totalErrors,

            percentage:
                Number(
                    percentage.toFixed(2)
                )
        },


        runs:
            history
    };


    // ========================================================
    // NOME DO FICHEIRO
    // ========================================================

    const startDate =
        new Date(
            period.periodStart
        )
        .toISOString()
        .slice(
            0,
            10
        );


    const endDate =
        now
        .toISOString()
        .slice(
            0,
            10
        );


    const reportFile =
        path.join(
            REPORTS_DIR,
            `monitor_${startDate}_${endDate}.json`
        );


    // ========================================================
    // GUARDAR RELATÓRIO
    // ========================================================

    fs.writeFileSync(

        reportFile,

        JSON.stringify(
            report,
            null,
            4
        ),

        "utf8"
    );


    // ========================================================
    // MOSTRAR RESULTADO
    // ========================================================

    console.log("");

    console.log(
        "=========================================="
    );

    console.log(
        "PERÍODO DE 2 DIAS TERMINADO"
    );

    console.log(
        "=========================================="
    );

    console.log(
        `Pedidos: ${totalRequests}`
    );

    console.log(
        `Sucesso: ${totalSuccess}`
    );

    console.log(
        `Erros: ${totalErrors}`
    );

    console.log(
        `Disponibilidade: ${percentage.toFixed(2)}%`
    );

    console.log("");

    console.log(
        "Relatório guardado em:"
    );

    console.log(
        reportFile
    );


    // ========================================================
    // RESET DOS RESULTADOS
    // ========================================================

    saveResults([]);


    // ========================================================
    // NOVO PERÍODO
    // ========================================================

    const newPeriod = {

        periodStart:
            now.toISOString()
    };


    savePeriod(
        newPeriod
    );


    console.log("");

    console.log(
        "Contadores resetados."
    );

    console.log(
        "Novo período iniciado:"
    );

    console.log(
        newPeriod.periodStart
    );

    console.log(
        "=========================================="
    );
}


// ============================================================
// EXECUTAR MONITOR
// ============================================================

async function runMonitor() {

    console.log("");

    console.log(
        "=========================================="
    );

    console.log(
        "INÍCIO DO TESTE"
    );

    console.log(
        new Date().toLocaleString(
            "pt-PT"
        )
    );

    console.log(
        "=========================================="
    );


    const requestResults = [];


    // ========================================================
    // FAZER 10 PEDIDOS
    // ========================================================

    for (
        let i = 0;
        i < REQUESTS_PER_RUN;
        i++
    ) {

        const result =
            await chamarAPI();


        requestResults.push(
            result
        );


        console.log(
            `Pedido ${i + 1}/${REQUESTS_PER_RUN}:`,
            result.status,
            result.httpStatus || ""
        );


        await sleep(500);
    }


    // ========================================================
    // RESULTADO DA EXECUÇÃO
    // ========================================================

    const success =
        requestResults.filter(
            r =>
                r.status === "success"
        ).length;


    const errors =
        requestResults.filter(
            r =>
                r.status === "error"
        ).length;


    const percentage =
        (
            success /
            REQUESTS_PER_RUN
        ) * 100;


    const run = {

        timestamp:
            new Date().toISOString(),

        total:
            REQUESTS_PER_RUN,

        success,

        errors,

        percentage,

        results:
            requestResults
    };


    // ========================================================
    // GUARDAR EXECUÇÃO
    // ========================================================

    let history =
        loadResults();


    history.push(
        run
    );


    saveResults(
        history
    );


    // ========================================================
    // RESULTADO ACUMULADO
    // ========================================================

    const totalRequests =
        history.reduce(
            (total, run) =>
                total + run.total,
            0
        );


    const totalSuccess =
        history.reduce(
            (total, run) =>
                total + run.success,
            0
        );


    const totalErrors =
        history.reduce(
            (total, run) =>
                total + run.errors,
            0
        );


    const globalPercentage =
        totalRequests > 0

            ? (
                totalSuccess /
                totalRequests
            ) * 100

            : 0;


    // ========================================================
    // MOSTRAR RESULTADO
    // ========================================================

    console.log("");

    console.log(
        "RESULTADO DESTA EXECUÇÃO"
    );

    console.log(
        "-------------------------"
    );

    console.log(
        `Pedidos: ${run.total}`
    );

    console.log(
        `Sucesso: ${run.success}`
    );

    console.log(
        `Erros:   ${run.errors}`
    );

    console.log(
        `Percentagem: ${run.percentage.toFixed(2)}%`
    );


    console.log("");

    console.log(
        "RESULTADO GLOBAL"
    );

    console.log(
        "----------------"
    );

    console.log(
        `Pedidos: ${totalRequests}`
    );

    console.log(
        `Sucesso: ${totalSuccess}`
    );

    console.log(
        `Erros:   ${totalErrors}`
    );

    console.log(
        `Disponibilidade: ${globalPercentage.toFixed(2)}%`
    );


    // ========================================================
    // VERIFICAR SE OS 2 DIAS TERMINARAM
    // ========================================================

    const period =
        loadPeriod();


    const periodStart =
        new Date(
            period.periodStart
        ).getTime();


    const elapsed =
        Date.now() -
        periodStart;


    console.log("");

    console.log(
        "Período atual:"
    );

    console.log(
        new Date(
            period.periodStart
        ).toLocaleString(
            "pt-PT"
        )
    );


    const remaining =
        Math.max(
            0,
            PERIOD_DURATION -
            elapsed
        );


    console.log(
        "Tempo restante:",
        formatDuration(
            remaining
        )
    );


    // ========================================================
    // RESET
    // ========================================================

    if (
        elapsed >=
        PERIOD_DURATION
    ) {

        archiveAndReset(
            history,
            period
        );
    }


    console.log("");

    console.log(
        "Próximo teste daqui a 1 hora."
    );
}


// ============================================================
// FORMATAR TEMPO
// ============================================================

function formatDuration(
    milliseconds
) {

    const totalSeconds =
        Math.floor(
            milliseconds /
            1000
        );


    const days =
        Math.floor(
            totalSeconds /
            86400
        );


    const hours =
        Math.floor(
            (
                totalSeconds %
                86400
            ) /
            3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds %
                3600
            ) /
            60
        );


    const seconds =
        totalSeconds %
        60;


    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}


// ============================================================
// SLEEP
// ============================================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


// ============================================================
// START
// ============================================================

async function start() {

    await runMonitor();


    setInterval(
        runMonitor,
        INTERVAL
    );
}


start();