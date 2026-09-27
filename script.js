// Konfigurasi Pola Rotasi P-S-OFF (3 Hari)
const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Pola Rotasi 3 Hari:
// Pola 0: Yusuf Pagi, Ahmad Siang, Diky OFF
// Pola 1: Diky Pagi, Yusuf Siang, Ahmad OFF
// Pola 2: Ahmad Pagi, Diky Siang, Yusuf OFF
const ROTASI = [
  { pagi: "Yusuf", siang: "Ahmad", off: "Diky" },  // Target Kombinasi
  { pagi: "Diky",  siang: "Yusuf", off: "Ahmad" },
  { pagi: "Ahmad", siang: "Diky",  off: "Yusuf" }
];

// Generasi Data Otomatis untuk Bulan Terkait
function buatDataBulan(tahun, bulanIndex, polaAwalIndex) {
  const data = [];
  const jumlahHari = new Date(tahun, bulanIndex + 1, 0).getDate();

  for (let tgl = 1; tgl <= jumlahHari; tgl++) {
    const dateObj = new Date(tahun, bulanIndex, tgl);
    const namaHari = NAMA_HARI[dateObj.getDay()];
    
    // Menghitung indeks rotasi berurutan
    const rotasiIndex = (polaAwalIndex + (tgl - 1)) % 3;
    const shift = ROTASI[rotasiIndex];

    data.push({
      tgl: tgl,
      hari: namaHari,
      pagi: shift.pagi,
      siang: shift.siang,
      off: shift.off,
      isTarget: (shift.pagi === "Yusuf" && shift.siang === "Ahmad")
    });
  }
  return data;
}

// Data Jadwal per Bulan (Kontinuitas Rotasi Terjaga)
// Oktober 2026 Tgl 1 dimulai dari Pola 1 (Diky P, Yusuf S, Ahmad OFF)
const dataJadwal = {
  oktober2026: {
    label: "PERIODE: OKTOBER 2026",
    list: buatDataBulan(2026, 9, 1) // 9 = Oktober (0-indexed)
  },
  november2026: {
    label: "PERIODE: NOVEMBER 2026",
    // 31 Okt = Pola 1, maka 1 Nov = Pola 2 (Ahmad P, Diky S, Yusuf OFF)
    list: buatDataBulan(2026, 10, 2) // 10 = November
  },
  desember2026: {
    label: "PERIODE: DESEMBER 2026",
    // 30 Nov = Pola 2, maka 1 Des = Pola 0 (Yusuf P, Ahmad S, Diky OFF)
    list: buatDataBulan(2026, 11, 0) // 11 = Desember
  }
};

let filterAktif = 'all';

// Fungsi Render Tabel ke HTML
function renderTabel(keyBulan) {
  const tbody = document.getElementById("tbodyJadwal");
  const dataBulan = dataJadwal[keyBulan].list;
  
  // Update Judul Header
  document.getElementById("judulPeriode").innerText = dataJadwal[keyBulan].label;

  let htmlRows = "";

  dataBulan.forEach(item => {
    const classHighlight = item.isTarget ? "class='highlight-row'" : "";
    
    htmlRows += `
      <tr ${classHighlight}>
        <td>${item.tgl}</td>
        <td>${item.hari}</td>
        <td>${item.pagi}</td>
        <td>${item.siang}</td>
        <td class="off">${item.off}</td>
      </tr>
    `;
  });

  tbody.innerHTML = htmlRows;
  
  // Terapkan ulang filter nama yang sedang aktif
  terapkanFilter();
}

// Event handler saat dropdown bulan diubah
function gantiBulan() {
  const bulanPilihan = document.getElementById("selectBulan").value;
  renderTabel(bulanPilihan);
}

// Fungsi Filter Nama Barista
function filterJadwal(nama) {
  filterAktif = nama;
  updateActiveButton(event.target);
  terapkanFilter();
}

// Fungsi Filter Kombinasi Khusus
function filterKombinasiKhusus() {
  filterAktif = 'khusus';
  updateActiveButton(event.target);
  terapkanFilter();
}

// Eksekusi penyaringan baris tabel
function terapkanFilter() {
  const rows = document.querySelectorAll("#tbodyJadwal tr");

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const pagi = cells[2].innerText;
    const siang = cells[3].innerText;
    const off = cells[4].innerText;

    resetTextHighlight(cells);

    if (filterAktif === 'all') {
      row.style.display = "";
    } else if (filterAktif === 'khusus') {
      if (row.classList.contains("highlight-row")) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    } else {
      if (pagi === filterAktif || siang === filterAktif || off === filterAktif) {
        row.style.display = "";
        highlightCellText(cells[2], filterAktif);
        highlightCellText(cells[3], filterAktif);
        highlightCellText(cells[4], filterAktif);
      } else {
        row.style.display = "none";
      }
    }
  });
}

function updateActiveButton(targetButton) {
  if (!targetButton) return;
  const buttons = document.querySelectorAll(".btn-filter");
  buttons.forEach(btn => btn.classList.remove("active"));
  targetButton.classList.add("active");
}

function highlightCellText(cell, nama) {
  if (cell.innerText === nama) {
    cell.innerHTML = `<span class="text-highlight">${nama}</span>`;
  }
}

function resetTextHighlight(cells) {
  for (let i = 2; i <= 4; i++) {
    cells[i].innerHTML = cells[i].innerText;
  }
}

// Inisialisasi awal saat halaman pertama kali dibuka
document.addEventListener("DOMContentLoaded", () => {
  renderTabel("oktober2026");
});
