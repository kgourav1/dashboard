const App = (function () {
  // --- STATE MANAGEMENT ---
  const DEFAULT_STATE = {
    shortcuts: [
      { id: "1", title: "GitHub", url: "https://github.com" },
      { id: "2", title: "Stack Overflow", url: "https://stackoverflow.com" },
    ],
    todos: [
      {
        id: "1",
        text: "Review pull requests",
        completed: false,
        priority: "high",
      },
    ],
    notes: "<h1>Project Ideas</h1><p>Start typing here...</p>",
    meetings: [],
    layout: ["shortcuts", "todos", "notes", "meetings"],
    stickies: [],
  };

  let state = JSON.parse(localStorage.getItem("devDashState")) || DEFAULT_STATE;
  if (!Array.isArray(state.stickies)) state.stickies = [];

  const saveState = () =>
    localStorage.setItem("devDashState", JSON.stringify(state));

  const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).substr(2);
  const $ = (id) => document.getElementById(id);
  const getFavicon = (url) =>
    `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;

  // --- MODAL SYSTEM (Used across the app) ---
  const modalSystem = {
    activeAction: null,
    open(title, inputsHtml, onSubmit) {
      $("modal-title").textContent = title;
      $("modal-inputs").innerHTML = inputsHtml;
      $("input-modal-overlay").classList.add("active");
      $("modal-inputs").querySelector("input").focus();
      this.activeAction = onSubmit;
    },
    close() {
      $("input-modal-overlay").classList.remove("active");
      $("modal-form").reset();
      this.activeAction = null;
    },
  };

  $("modal-cancel").addEventListener("click", () => modalSystem.close());
  $("modal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (modalSystem.activeAction) modalSystem.activeAction();
  });

  // --- UI RENDERERS ---

  const renderShortcuts = () => {
    const container = $("shortcuts-container");
    container.innerHTML = state.shortcuts
      .map(
        (s) => `
            <div class="shortcut-wrapper" data-id="${s.id}">
                <div class="shortcut-actions">
                    <button class="s-action-btn edit" title="Edit Shortcut">✏️</button>
                    <button class="s-action-btn del" title="Delete Shortcut">×</button>
                </div>
                <a href="${s.url}" target="_blank" class="shortcut-item">
                    <div class="shortcut-icon"><img src="${getFavicon(s.url)}" alt="${s.title}" onerror="this.style.display='none'"></div>
                    <span>${s.title}</span>
                </a>
            </div>
        `,
      )
      .join("");
  };

  const renderTodos = (filter = "all") => {
    const list = $("todo-list");
    const filtered = state.todos.filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    });

    list.innerHTML = filtered
      .map(
        (t) => `
            <li class="todo-item ${t.completed ? "completed" : ""}" data-id="${t.id}">
                <input type="checkbox" class="todo-checkbox" ${t.completed ? "checked" : ""}>
                <span class="todo-text">${t.text}</span>
                <span class="todo-priority p-${t.priority}" title="Priority: ${t.priority}"></span>
                <button class="delete-btn" aria-label="Delete">×</button>
            </li>
        `,
      )
      .join("");
  };

  const renderNotes = () => {
    $("note-editor").innerHTML = state.notes;
  };

  const renderMeetings = () => {
    const list = $("meeting-list");
    const now = new Date();

    state.meetings = state.meetings.filter((m) => new Date(m.datetime) > now);
    saveState();
    state.meetings.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    if (state.meetings.length === 0) {
      list.innerHTML =
        '<p style="color: var(--text-secondary); font-size: 0.9rem;">No upcoming meetings.</p>';
      return;
    }

    list.innerHTML = state.meetings
      .map((m) => {
        const dateObj = new Date(m.datetime);
        const timeStr = dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateStr = dateObj.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        });

        let timeInfo = `${dateStr} - ${timeStr}`;
        const diffMs = dateObj - now;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24 && dateObj.getDate() === now.getDate()) {
          timeInfo = `<span style="color:var(--accent)">Today at ${timeStr}</span>`;
        }

        return `
                <li class="meeting-item" data-id="${m.id}">
                    <div class="meeting-title">${m.title}</div>
                    <div class="meeting-time">${timeInfo} <button class="icon-btn del-meeting" style="font-size:0.8rem">×</button></div>
                </li>
            `;
      })
      .join("");
  };

  const initQuotes = () => {
    const quotes = [
      "“Talk is cheap. Show me the code.” – Linus Torvalds",
      "“First, solve the problem. Then, write the code.” – John Johnson",
      "“Experience is the name everyone gives to their mistakes.” – Oscar Wilde",
      "“Make it work, make it right, make it fast.” – Kent Beck",
      "“Simplicity is the soul of efficiency.” – Austin Freeman",
      "“Code is like humor. When you have to explain it, it’s bad.” – Cory House",
    ];
    $("quote-container").innerHTML =
      `<p>${quotes[Math.floor(Math.random() * quotes.length)]}</p>`;
  };

  // --- COMPONENT LOGIC ---

  const initShortcuts = () => {
    // Adding new shortcuts
    $("add-shortcut-btn").addEventListener("click", () => {
      modalSystem.open(
        "Add Shortcut",
        `
                <input type="text" id="sc-title" placeholder="Title (e.g. GitHub)" required>
                <input type="url" id="sc-url" placeholder="URL (https://...)" required>
            `,
        () => {
          state.shortcuts.push({
            id: generateId(),
            title: $("sc-title").value,
            url: $("sc-url").value,
          });
          saveState();
          renderShortcuts();
          modalSystem.close();
        },
      );
    });

    // Edit/Delete Delegation
    $("shortcuts-container").addEventListener("click", (e) => {
      const wrapper = e.target.closest(".shortcut-wrapper");
      if (!wrapper) return;
      const id = wrapper.dataset.id;

      if (e.target.closest(".s-action-btn.del")) {
        state.shortcuts = state.shortcuts.filter((s) => s.id !== id);
        saveState();
        renderShortcuts();
      } else if (e.target.closest(".s-action-btn.edit")) {
        const shortcut = state.shortcuts.find((s) => s.id === id);
        modalSystem.open(
          "Edit Shortcut",
          `
                    <input type="text" id="sc-title" value="${shortcut.title}" required>
                    <input type="url" id="sc-url" value="${shortcut.url}" required>
                `,
          () => {
            shortcut.title = $("sc-title").value;
            shortcut.url = $("sc-url").value;
            saveState();
            renderShortcuts();
            modalSystem.close();
          },
        );
      }
    });
  };

  const initStickies = () => {
    const layer = $("stickies-layer");
    let draggedSticky = null;
    let offsetX = 0,
      offsetY = 0;

    const renderStickiesLayer = () => {
      layer.innerHTML = state.stickies
        .map(
          (s) => `
                <div class="sticky-note" data-id="${s.id}" style="left: ${s.x}px; top: ${s.y}px;">
                    <div class="sticky-header">
                        <span>📌 Sticky</span>
                        <button class="close-sticky" title="Delete">×</button>
                    </div>
                    <textarea class="sticky-content" placeholder="Jot something down...">${s.text}</textarea>
                </div>
            `,
        )
        .join("");
    };

    renderStickiesLayer();

    $("add-sticky-btn").addEventListener("click", () => {
      const offset = state.stickies.length * 20;
      state.stickies.push({
        id: generateId(),
        text: "",
        x: Math.max(20, window.innerWidth / 2 - 110 + offset),
        y: Math.max(20, window.innerHeight / 2 - 110 + offset),
      });
      saveState();
      renderStickiesLayer();
    });

    document.addEventListener("mousedown", (e) => {
      if (
        e.target.closest(".sticky-header") &&
        !e.target.classList.contains("close-sticky")
      ) {
        draggedSticky = e.target.closest(".sticky-note");
        const rect = draggedSticky.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document
          .querySelectorAll(".sticky-note")
          .forEach((n) => (n.style.zIndex = "1000"));
        draggedSticky.style.zIndex = "1001";
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!draggedSticky) return;
      let newX = Math.max(
        0,
        Math.min(
          e.clientX - offsetX,
          window.innerWidth - draggedSticky.offsetWidth,
        ),
      );
      let newY = Math.max(
        0,
        Math.min(
          e.clientY - offsetY,
          window.innerHeight - draggedSticky.offsetHeight,
        ),
      );
      draggedSticky.style.left = newX + "px";
      draggedSticky.style.top = newY + "px";
    });

    document.addEventListener("mouseup", () => {
      if (draggedSticky) {
        const stickyData = state.stickies.find(
          (s) => s.id === draggedSticky.dataset.id,
        );
        if (stickyData) {
          stickyData.x = parseInt(draggedSticky.style.left, 10);
          stickyData.y = parseInt(draggedSticky.style.top, 10);
          saveState();
        }
        draggedSticky = null;
      }
    });

    let typeTimeout;
    document.addEventListener("input", (e) => {
      if (e.target.classList.contains("sticky-content")) {
        clearTimeout(typeTimeout);
        typeTimeout = setTimeout(() => {
          const stickyData = state.stickies.find(
            (s) => s.id === e.target.closest(".sticky-note").dataset.id,
          );
          if (stickyData) {
            stickyData.text = e.target.value;
            saveState();
          }
        }, 500);
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("close-sticky")) {
        const noteEl = e.target.closest(".sticky-note");
        state.stickies = state.stickies.filter(
          (s) => s.id !== noteEl.dataset.id,
        );
        saveState();
        noteEl.remove();
      }
    });
  };

  const initDragAndDrop = () => {
    const grid = $("dashboard-grid");
    let draggedWidget = null;

    state.layout.forEach((id) => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) grid.appendChild(el);
    });

    grid.addEventListener("dragstart", (e) => {
      if (e.target.closest(".widget-header")) {
        draggedWidget = e.target.closest(".widget");
        setTimeout(() => draggedWidget.classList.add("dragging"), 0);
      } else {
        e.preventDefault();
      }
    });

    grid.addEventListener("dragend", () => {
      if (!draggedWidget) return;
      draggedWidget.classList.remove("dragging");
      document
        .querySelectorAll(".widget")
        .forEach((w) => w.classList.remove("drag-over"));
      state.layout = Array.from(grid.children)
        .map((w) => w.getAttribute("data-id"))
        .filter((id) => id !== null);
      saveState();
      draggedWidget = null;
    });

    grid.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!draggedWidget) return;
      const afterElement = [
        ...grid.querySelectorAll(".widget:not(.dragging)"),
      ].reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = Math.hypot(
            e.clientX - (box.left + box.width / 2),
            e.clientY - (box.top + box.height / 2),
          );
          return offset < closest.offset
            ? { offset: offset, element: child }
            : closest;
        },
        { offset: Number.POSITIVE_INFINITY },
      ).element;

      document
        .querySelectorAll(".widget")
        .forEach((w) => w.classList.remove("drag-over"));
      const currentHover = e.target.closest(".widget");
      if (currentHover && currentHover !== draggedWidget)
        currentHover.classList.add("drag-over");

      if (afterElement == null) {
        grid.insertBefore(draggedWidget, $("quote-container"));
      } else {
        grid.insertBefore(draggedWidget, afterElement);
      }
    });
  };

  const initSystemBar = () => {
    const updateClock = () => {
      const now = new Date();
      $("live-clock").textContent = now.toLocaleTimeString();
      $("current-date").textContent = now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      const hour = now.getHours();
      $("greeting").textContent =
        hour < 12
          ? "Good morning"
          : hour < 18
            ? "Good afternoon"
            : "Good evening";
    };
    setInterval(updateClock, 1000);
    updateClock();
  };

  const initTodos = () => {
    $("todo-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("todo-input");
      if (!input.value.trim()) return;
      state.todos.push({
        id: generateId(),
        text: input.value.trim(),
        completed: false,
        priority: $("todo-priority").value,
      });
      input.value = "";
      saveState();
      renderTodos($("todo-filter").value);
    });

    $("todo-list").addEventListener("click", (e) => {
      const item = e.target.closest(".todo-item");
      if (!item) return;
      if (e.target.classList.contains("todo-checkbox")) {
        state.todos.find((t) => t.id === item.dataset.id).completed =
          e.target.checked;
        saveState();
        renderTodos($("todo-filter").value);
      }
      if (e.target.classList.contains("delete-btn")) {
        state.todos = state.todos.filter((t) => t.id !== item.dataset.id);
        saveState();
        renderTodos($("todo-filter").value);
      }
    });

    $("todo-filter").addEventListener("change", (e) =>
      renderTodos(e.target.value),
    );
  };

  const initNotes = () => {
    const editor = $("note-editor");
    let timeout;
    editor.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        state.notes = editor.innerHTML;
        saveState();
      }, 500);
    });

    editor.addEventListener("keyup", (e) => {
      if (e.key === "Space" || e.code === "Space") {
        const node = window.getSelection().focusNode;
        if (node && node.nodeType === 3) {
          const text = node.textContent;
          if (text.startsWith("# ")) {
            document.execCommand("formatBlock", false, "H1");
            node.textContent = text.substring(2);
          } else if (text.startsWith("## ")) {
            document.execCommand("formatBlock", false, "H2");
            node.textContent = text.substring(3);
          } else if (text.startsWith("- ")) {
            document.execCommand("insertUnorderedList");
            node.textContent = text.substring(2);
          }
        }
      }
    });
  };

  const initMeetings = () => {
    $("add-meeting-btn").addEventListener("click", () => {
      modalSystem.open(
        "Add Meeting",
        `
                <input type="text" id="mtg-title" placeholder="Meeting Title" required>
                <input type="datetime-local" id="mtg-time" required>
            `,
        () => {
          state.meetings.push({
            id: generateId(),
            title: $("mtg-title").value,
            datetime: $("mtg-time").value,
          });
          saveState();
          renderMeetings();
          modalSystem.close();
        },
      );
    });

    $("meeting-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("del-meeting")) {
        state.meetings = state.meetings.filter(
          (m) => m.id !== e.target.closest(".meeting-item").dataset.id,
        );
        saveState();
        renderMeetings();
      }
    });
  };

  const initCommandPalette = () => {
    const overlay = $("cmd-palette-overlay"),
      input = $("cmd-input"),
      resultsList = $("cmd-results");
    const togglePalette = () => {
      if (overlay.classList.contains("active")) {
        overlay.classList.remove("active");
      } else {
        overlay.classList.add("active");
        input.value = "";
        renderCmdResults("");
        input.focus();
      }
    };

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === "Escape" && overlay.classList.contains("active")) {
        togglePalette();
      }
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) togglePalette();
    });

    const renderCmdResults = (query) => {
      query = query.toLowerCase();
      let results = [];
      state.shortcuts.forEach((s) => {
        if (s.title.toLowerCase().includes(query))
          results.push({
            type: "Shortcut",
            text: s.title,
            action: () => window.open(s.url, "_blank"),
          });
      });
      state.todos.forEach((t) => {
        if (t.text.toLowerCase().includes(query))
          results.push({
            type: "Task",
            text: t.text,
            action: () => {
              togglePalette();
              $("todo-input").focus();
            },
          });
      });
      if ("add task".includes(query))
        results.push({
          type: "Command",
          text: "Add new task",
          action: () => {
            togglePalette();
            $("todo-input").focus();
          },
        });

      if (results.length === 0) {
        resultsList.innerHTML = `<li class="cmd-item"><span style="color:var(--text-secondary)">No results found.</span></li>`;
        return;
      }

      resultsList.innerHTML = results
        .slice(0, 8)
        .map(
          (r, i) =>
            `<li class="cmd-item" data-idx="${i}"><span>${r.text}</span><span class="cmd-type">${r.type}</span></li>`,
        )
        .join("");
      resultsList.querySelectorAll(".cmd-item").forEach((el) => {
        el.addEventListener("click", () => {
          const idx = el.getAttribute("data-idx");
          if (idx && results[idx]) {
            results[idx].action();
            togglePalette();
          }
        });
      });
    };
    input.addEventListener("input", (e) => renderCmdResults(e.target.value));
  };

  // --- BOOTSTRAP ---
  return {
    init: () => {
      initSystemBar();
      renderShortcuts();
      renderTodos();
      renderNotes();
      renderMeetings();

      initDragAndDrop();
      initTodos();
      initNotes();
      initMeetings();
      initCommandPalette();
      initQuotes();
      initStickies();
      initShortcuts();
    },
  };
})();

document.addEventListener("DOMContentLoaded", App.init);
