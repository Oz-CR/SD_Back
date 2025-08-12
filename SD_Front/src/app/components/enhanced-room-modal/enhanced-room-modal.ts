import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';

interface Color {
  name: string;
  displayName: string;
  hexColor: string;
}

interface EnhancedRoomData {
  gameName: string;
  colorCount: number;
  selectedColors?: string[];
  useCustomColors: boolean;
}

@Component({
  selector: 'app-enhanced-room-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" [class.active]="isVisible" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="modal-title">
            <div class="title-badge">
              <span class="badge-icon">🎮</span>
              Nueva Partida
            </div>
            <h2>Crear Partida Personalizada</h2>
            <p class="modal-subtitle">Configura tu partida de Simon Says</p>
          </div>
          <button class="close-button" (click)="closeModal()">
            <span>&times;</span>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form class="create-room-form" (ngSubmit)="onSubmit()" #form="ngForm">
            <!-- Campo Nombre de la Partida -->
            <div class="form-group">
              <label class="form-label" for="gameName">Nombre de la Partida</label>
              <input
                type="text"
                id="gameName"
                name="gameName"
                class="form-input"
                placeholder="Ingresa el nombre de tu partida"
                [(ngModel)]="roomData.gameName"
                required
                #gameNameInput="ngModel"
                maxlength="30"
              />
              <div
                class="error-message"
                *ngIf="gameNameInput.invalid && gameNameInput.touched"
              >
                El nombre de la partida es requerido
              </div>
            </div>

            <!-- Selector de Modo -->
            <div class="form-group">
              <label class="form-label">Modo de Colores</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input
                    type="radio"
                    name="colorMode"
                    [value]="false"
                    [(ngModel)]="roomData.useCustomColors"
                  />
                  <span class="radio-custom"></span>
                  <div class="radio-content">
                    <span class="radio-title">Cantidad Fija</span>
                    <span class="radio-desc">Elige solo la cantidad de colores</span>
                  </div>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    name="colorMode"
                    [value]="true"
                    [(ngModel)]="roomData.useCustomColors"
                  />
                  <span class="radio-custom"></span>
                  <div class="radio-content">
                    <span class="radio-title">Colores Personalizados</span>
                    <span class="radio-desc">Elige colores específicos</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Campo Cantidad de Colores (modo simple) -->
            <div class="form-group" *ngIf="!roomData.useCustomColors">
              <label class="form-label" for="colorCount">Cantidad de Colores</label>
              <input
                type="number"
                id="colorCount"
                name="colorCount"
                class="form-input"
                placeholder="Cantidad de colores (2-50)"
                [(ngModel)]="roomData.colorCount"
                min="2"
                max="50"
                required
                #colorCountInput="ngModel"
              />
              <div
                class="error-message"
                *ngIf="colorCountInput.touched && (roomData.colorCount < 2 || roomData.colorCount > 50)"
              >
                La cantidad de colores debe estar entre 2 y 50
              </div>
            </div>

            <!-- Selector de Colores Personalizados -->
            <div class="form-group" *ngIf="roomData.useCustomColors">
              <label class="form-label">Seleccionar Colores (mínimo 2)</label>
              <div class="colors-grid">
                <div
                  *ngFor="let color of availableColors"
                  class="color-option"
                  [class.selected]="isColorSelected(color.name)"
                  (click)="toggleColor(color.name)"
                  [style.background-color]="color.hexColor"
                  [title]="color.displayName"
                >
                  <div class="color-check" *ngIf="isColorSelected(color.name)">✓</div>
                  <span class="color-name">{{ color.displayName }}</span>
                </div>
              </div>
              <div class="selected-count">
                Colores seleccionados: {{ getSelectedColors().length }}
              </div>
              <div
                class="error-message"
                *ngIf="roomData.useCustomColors && getSelectedColors().length < 2"
              >
                Debes seleccionar al menos 2 colores
              </div>
            </div>

            <!-- Información de Dificultad -->
            <div class="difficulty-info">
              <div class="info-card">
                <div class="info-icon">⚡</div>
                <div class="info-content">
                  <h4>Dificultad: {{ getDifficultyLabel() }}</h4>
                  <p>{{ getDifficultyDescription() }}</p>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" [disabled]="!isFormValid()">
                Crear Partida
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./enhanced-room-modal.css']
})
export class EnhancedRoomModalComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() createRoomEvent = new EventEmitter<EnhancedRoomData>();

  roomData: EnhancedRoomData = {
    gameName: '',
    colorCount: 4,
    useCustomColors: false,
    selectedColors: []
  };

  availableColors: Color[] = [];
  selectedColorNames: Set<string> = new Set();

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadAvailableColors();
  }

  private loadAvailableColors(): void {
    // Cargar los colores base disponibles
    const baseColors = [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple',
      'pink', 'cyan', 'lime', 'indigo'
    ];
    this.availableColors = this.gameService.getColorObjects(baseColors);
  }

  closeModal(): void {
    this.isVisible = false;
    this.closeModalEvent.emit();
    this.resetForm();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      const finalData: EnhancedRoomData = { ...this.roomData };
      
      if (this.roomData.useCustomColors) {
        finalData.selectedColors = Array.from(this.selectedColorNames);
        finalData.colorCount = finalData.selectedColors.length;
      } else {
        finalData.selectedColors = undefined;
      }

      this.createRoomEvent.emit(finalData);
      this.closeModal();
    }
  }

  toggleColor(colorName: string): void {
    if (this.selectedColorNames.has(colorName)) {
      this.selectedColorNames.delete(colorName);
    } else {
      this.selectedColorNames.add(colorName);
    }
  }

  isColorSelected(colorName: string): boolean {
    return this.selectedColorNames.has(colorName);
  }

  getSelectedColors(): string[] {
    return Array.from(this.selectedColorNames);
  }

  isFormValid(): boolean {
    const nameValid = this.roomData.gameName.trim().length > 0;
    
    if (this.roomData.useCustomColors) {
      return nameValid && this.selectedColorNames.size >= 2;
    } else {
      return nameValid && this.roomData.colorCount >= 2 && this.roomData.colorCount <= 50;
    }
  }

  getDifficultyLabel(): string {
    const colorCount = this.roomData.useCustomColors 
      ? this.selectedColorNames.size 
      : this.roomData.colorCount;

    const difficultyLabels: { [key: number]: string } = {
      2: 'Fácil',
      3: 'Medio',
      4: 'Difícil',
      5: 'Muy Difícil',
      6: 'Experto'
    };
    
    if (colorCount <= 6) {
      return difficultyLabels[colorCount] || 'Personalizado';
    } else if (colorCount <= 10) {
      return 'Extremo';
    } else {
      return 'Imposible';
    }
  }

  getDifficultyDescription(): string {
    const colorCount = this.roomData.useCustomColors 
      ? this.selectedColorNames.size 
      : this.roomData.colorCount;

    const descriptions: { [key: number]: string } = {
      2: 'Perfecto para principiantes. Secuencias simples y fáciles de recordar.',
      3: 'Nivel intermedio. Requiere más concentración y memoria.',
      4: 'Nivel avanzado. Desafío estándar de Simon Says.',
      5: 'Nivel muy avanzado. Requiere excelente memoria y concentración.',
      6: 'Nivel experto. Gran desafío para jugadores experimentados.'
    };
    
    if (colorCount <= 6) {
      return descriptions[colorCount] || 
             `Desafío personalizado con ${colorCount} colores.`;
    } else {
      return `Desafío extremo con ${colorCount} colores. ¡Solo para maestros!`;
    }
  }

  private resetForm(): void {
    this.roomData = {
      gameName: '',
      colorCount: 4,
      useCustomColors: false,
      selectedColors: []
    };
    this.selectedColorNames.clear();
  }
}
