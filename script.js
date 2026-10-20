let selectedType = "";

function selectType(type) {
    selectedType = type;

    document.getElementById("classroomBtn").classList.remove("selected");
    document.getElementById("labBtn").classList.remove("selected");

    if (type === "Classroom") {
        document.getElementById("classroomBtn").classList.add("selected");
    } else {
        document.getElementById("labBtn").classList.add("selected");
    }
}

async function searchSpaces() {

    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const results = document.getElementById("results");

    // Check input
    if (!date || !startTime || !endTime || !selectedType) {
        results.innerHTML = `
            <div class="message">
                ⚠️ Please select date, time and space type.
            </div>
        `;
        return;
    }

    // Check time
    if (startTime >= endTime) {
        results.innerHTML = `
            <div class="message">
                ⚠️ Please select a valid time range.
            </div>
        `;
        return;
    }

    // Loading message
    results.innerHTML = `
        <div class="message">
            🔄 Checking availability...
        </div>
    `;

    try {

        // Connect to Java backend
        const url =
            `http://localhost:8080/availability` +
            `?date=${encodeURIComponent(date)}` +
            `&start=${encodeURIComponent(startTime + ":00")}` +
            `&end=${encodeURIComponent(endTime + ":00")}` +
            `&type=${encodeURIComponent(selectedType)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Server error");
        }

        const spaces = await response.json();

        // No spaces found
        if (spaces.length === 0) {
            results.innerHTML = `
                <h2>${selectedType} Availability</h2>

                <div class="message">
                    ❌ No ${selectedType.toLowerCase()} found.
                </div>
            `;
            return;
        }

        // Display results
        results.innerHTML = `
            <h2>${selectedType} Availability</h2>

            <div class="space-grid">

                ${spaces.map(space => `

                    <div class="space-card">

                        <h3>${space.room}</h3>

                        <p>
                            📍 ${space.block} • Floor ${space.floor}
                        </p>

                        <p>
                            👥 Capacity: ${space.capacity}
                        </p>

                        <div class="status ${space.status.toLowerCase()}">
                            ${space.status}
                        </div>

                        ${
                            space.status === "OCCUPIED"
                            ?
                            `
                            <div class="class-details">

                                <p>
                                    📚 <b>Class:</b>
                                    ${space.className}
                                </p>

                                <p>
                                    👨‍🏫 <b>Teacher:</b>
                                    ${space.teacher}
                                </p>

                                <p>
                                    👥 <b>Students:</b>
                                    ${space.students}/${space.capacity}
                                </p>

                            </div>
                            `
                            :
                            `
                            <div class="class-details">
                                <p>✓ No class scheduled</p>
                                <p>Space is ready to use.</p>
                            </div>
                            `
                        }

                    </div>

                `).join("")}

            </div>
        `;

    } catch (error) {

        console.error(error);

        results.innerHTML = `
            <div class="message">
                ❌ Unable to connect to SPATIA backend.
                <br><br>
                Please make sure the Java server is running.
            </div>
        `;
    }
}