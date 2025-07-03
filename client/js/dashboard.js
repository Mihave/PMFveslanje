document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("section-selector");
    const content = document.getElementById("dashboard-content");
    const logoutBtn = document.getElementById("logout-btn");

    const userJSON = sessionStorage.getItem('user');
    if (!userJSON) {
        console.log("No logged in user");
        window.location.href = "client/index.html";
        return;
    }

    const user = JSON.parse(userJSON);
    console.log("Logged in: ", user);


    async function loadSection(section) {
        // You can replace this with actual dynamic content loading
        switch (section) {
            case "current":
                content.innerHTML = "<h2>Current Training</h2><p>Today's workout: 5x500m intervals.</p>";
                break;
            case "history":
                content.innerHTML = "<h2>Training History</h2><p>Showing past training data...</p>";
                await loadHistory(section);
                break;
            case "plan":
                content.innerHTML = "<h2>Full Training Plan</h2><p>Here is your weekly training schedule.</p>";
                break;
            case "userdata":
                content.innerHTML = `
                    <h2>User Data</h2>
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                `;
                break;
        }
    }

    dropdown.addEventListener("change", () => {
        loadSection(dropdown.value);
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem('user');
        window.location.href = "index.html";
    });

    // Load default section
    loadSection(dropdown.value);
});


async function vrijemeUSekunde(t) {
    vr = t.split(":");
    return parseFloat(vr[0] * 60 + vr[1]);
}

async function loadHistory(section) {
    const res = await fetch('/server/tempdata.JSON');
    const data = await res.json();
    const user = JSON.parse(sessionStorage.getItem('user'));
    const periodi = data.periodi;

    if (user.spol === 'm') {
        let testovi = data.rezultati['1000m'].filter((it) => it.ime === user.ime);
        testovi.forEach(async t => t.vrijeme = await vrijemeUSekunde(t.vrijeme));
        renderUserTestChart(user, testovi, '1000m', periodi);
    } else if (user.spol === 'f') {
        const testovi = data.rezultati['500m'].filter((it) => it.ime === user.ime);
    }

}

async function renderUserTestChart(user, userResults, testType, periods, containerId = "dashboard-content") {
    // Ensure the container exists or create it
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        document.body.appendChild(container);
    }

    // Clear previous canvas/chart if it exists
    container.innerHTML = ""; // removes previous canvas if re-rendered

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.id = "testResultsChart";
    canvas.width = 800;
    canvas.height = 400;
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    // Group results by period (supporting multiple per period)
    const periodToTimes = {};
    userResults.forEach(r => {
        if (!periodToTimes[r.period]) {
            periodToTimes[r.period] = [];
        }
        periodToTimes[r.period].push(r.vrijeme);
    });
    

    // Prepare chart data
    const labels = periods.filter(p => periodToTimes[p]);
    const data = labels.map(p => {
        let times = periodToTimes[p];
        times = times.map(t => {
            const [min, sec] = t.split(":");
            const m = parseInt(min);
            const s = parseFloat(sec);
            return 2*(m * 60 + s);
        });
        
        return times.reduce((sum, t) => sum + t, 0) / times.length;
    });
    console.log(data)
    // Create chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${testType} Test Time (s)`,
                data: data,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `${testType} Test Results for ${user.ime}`
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Time (s)"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Training Period"
                    }
                }
            }
        }
    });
}
