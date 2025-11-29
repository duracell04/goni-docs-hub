// Content management system for Goni Docs
// This module scans markdown files and builds a content tree

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export interface Page {
  section: string;
  title: string;
  slug: string[];
  filepath: string;
  githubUrl: string;
  content: string;
}

export interface Section {
  id: string;
  title: string;
  pages: Page[];
}

// Mock data structure - In production, this would be populated at build time
// by scanning ../docs, ../hardware, ../software directories
const mockContent: { [key: string]: Page[] } = {
  overview: [
    {
      section: "overview",
      title: "Goni Overview",
      slug: [],
      filepath: "../README.md",
      githubUrl: "https://github.com/duracell04/goni/blob/main/README.md",
      content: `# Goni

A sovereign compute platform for local-first infrastructure.

## What is Goni?

Goni is an open-source hardware and software project focused on building minimal, Swiss-engineered compute nodes for local-first applications.

## Key Features

- **Local-first**: Your data stays on your hardware
- **Sovereign**: You control the infrastructure
- **Minimal**: Clean, focused design
- **Open**: Fully documented and reproducible

## Getting Started

Explore the documentation sections:
- [Documentation](/docs) - Technical specifications and guides
- [Hardware](/hardware) - PCB designs, BOMs, and assembly
- [Software](/software) - Firmware, drivers, and tools`,
    },
  ],
  docs: [
    {
      section: "docs",
      title: "Getting Started",
      slug: ["getting-started"],
      filepath: "../docs/getting-started.md",
      githubUrl: "https://github.com/duracell04/goni/blob/main/docs/getting-started.md",
      content: `# Getting Started with Goni

This guide will help you set up your first Goni node.

## Prerequisites

- Basic understanding of Linux systems
- Soldering equipment (for hardware assembly)
- USB-C power supply (5V, 3A minimum)

## Installation Steps

1. **Assemble the hardware** - Follow the hardware guide
2. **Flash the firmware** - Use the provided tools
3. **Configure networking** - Set up your local network
4. **Deploy services** - Start running your applications

## Next Steps

- Read the [Hardware Guide](/hardware/assembly)
- Explore [Software Configuration](/software/config)`,
    },
    {
      section: "docs",
      title: "Architecture",
      slug: ["architecture"],
      filepath: "../docs/architecture.md",
      githubUrl: "https://github.com/duracell04/goni/blob/main/docs/architecture.md",
      content: `# Goni Architecture

## System Overview

Goni uses a layered architecture for maximum flexibility and maintainability.

### Hardware Layer

- ARM Cortex-A53 quad-core processor
- 4GB LPDDR4 RAM
- eMMC storage with microSD expansion
- Ethernet and WiFi connectivity

### Software Stack

- **Base OS**: Minimal Linux distribution
- **Container Runtime**: Docker for service isolation
- **Networking**: WireGuard VPN, local DNS
- **Storage**: ZFS for data integrity

## Design Principles

1. **Simplicity**: Minimal moving parts
2. **Reliability**: Redundancy where needed
3. **Performance**: Optimized for local workloads
4. **Security**: Defense in depth`,
    },
  ],
  hardware: [
    {
      section: "hardware",
      title: "Hardware Overview",
      slug: ["overview"],
      filepath: "../hardware/overview.md",
      githubUrl: "https://github.com/duracell04/goni/blob/main/hardware/overview.md",
      content: `# Hardware Overview

The Goni hardware platform is designed for reliability and ease of assembly.

## Specifications

- **CPU**: ARM Cortex-A53 quad-core @ 1.8GHz
- **RAM**: 4GB LPDDR4
- **Storage**: 32GB eMMC + microSD slot
- **Networking**: Gigabit Ethernet, WiFi 5
- **Power**: USB-C PD, 15W typical
- **Form Factor**: 100mm x 100mm PCB

## Design Files

All design files are available in the repository:
- KiCad PCB design files
- Gerber files for manufacturing
- 3D models (STEP format)
- Bill of materials (BOM)`,
    },
    {
      section: "hardware",
      title: "Assembly Guide",
      slug: ["assembly"],
      filepath: "../hardware/assembly.md",
      githubUrl: "https://github.com/duracell04/goni/blob/main/hardware/assembly.md",
      content: `# Assembly Guide

## Tools Required

- Soldering iron (temperature controlled)
- Solder (lead-free recommended)
- Flux
- Tweezers
- Multimeter
- Hot air rework station (optional)

## Assembly Steps

### 1. SMD Components

Start with the smallest components first:
1. Resistors and capacitors
2. Voltage regulators
3. Crystal oscillators

### 2. Main Components

1. SoC (System on Chip)
2. RAM chips
3. Storage (eMMC)

### 3. Connectors

1. USB-C power connector
2. Ethernet RJ45
3. microSD slot
4. GPIO headers

## Testing

After assembly, verify:
- No short circuits
- Proper voltage rails
- Boot sequence`,
    },
  ],
  software: [
    {
      section: "software",
      title: "Software Overview",
      slug: ["overview"],
      filepath: "../software/overview.md",
      githubUrl: "https://github.com/duracell04/goni/blob/main/software/overview.md",
      content: `# Software Overview

Goni's software stack is designed for simplicity and sovereignty.

## Operating System

Based on Alpine Linux for minimal footprint:
- Kernel 6.1 LTS
- Busybox utilities
- Custom init system

## Core Services

### Container Runtime

Docker CE for running applications in isolation.

### Networking

- WireGuard VPN for secure remote access
- CoreDNS for local DNS resolution
- Traefik for HTTP reverse proxy

### Storage

- ZFS for filesystem with snapshots
- Automatic backup to external drives
- S3-compatible object storage

## Configuration

All configuration is stored in Git for versioning and rollback.`,
    },
    {
      section: "software",
      title: "Configuration",
      slug: ["config"],
      filepath: "../software/config.md",
      githubUrl: "https://github.com/duracell04/goni/blob/main/software/config.md",
      content: `# Configuration Guide

## Initial Setup

### 1. Network Configuration

Edit \`/etc/network/interfaces\`:

\`\`\`
auto eth0
iface eth0 inet dhcp
\`\`\`

### 2. SSH Access

Generate SSH keys:
\`\`\`bash
ssh-keygen -t ed25519 -C "goni@local"
\`\`\`

Add your public key to \`~/.ssh/authorized_keys\`

### 3. Docker Setup

Install Docker:
\`\`\`bash
apk add docker docker-compose
rc-update add docker boot
service docker start
\`\`\`

## Service Configuration

### WireGuard VPN

Generate keys:
\`\`\`bash
wg genkey | tee privatekey | wg pubkey > publickey
\`\`\`

Configure \`/etc/wireguard/wg0.conf\`:
\`\`\`ini
[Interface]
PrivateKey = YOUR_PRIVATE_KEY
Address = 10.0.0.1/24
ListenPort = 51820
\`\`\`

## Backup Strategy

Automated daily snapshots to external storage.`,
    },
  ],
};

export function getSections(): Section[] {
  return [
    {
      id: "overview",
      title: "Overview",
      pages: mockContent.overview || [],
    },
    {
      id: "docs",
      title: "Documentation",
      pages: mockContent.docs || [],
    },
    {
      id: "hardware",
      title: "Hardware",
      pages: mockContent.hardware || [],
    },
    {
      id: "software",
      title: "Software",
      pages: mockContent.software || [],
    },
  ];
}

export function getPageBySlug(section: string, slugSegments: string[]): Page | null {
  const pages = mockContent[section] || [];
  
  // Handle overview (empty slug)
  if (section === "overview" && slugSegments.length === 0) {
    return pages[0] || null;
  }
  
  // Find matching page by slug
  return pages.find((page) => {
    if (page.slug.length !== slugSegments.length) return false;
    return page.slug.every((segment, i) => segment === slugSegments[i]);
  }) || null;
}

export function getPageToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    toc.push({ id, title, level });
  }

  return toc;
}

export function getAllPages(): Page[] {
  return Object.values(mockContent).flat();
}
