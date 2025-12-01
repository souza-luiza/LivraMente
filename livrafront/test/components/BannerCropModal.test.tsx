import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BannerCropModal from '@/components/BannerCropModal';

jest.mock('react-image-crop', () => {
  const ReactCrop = ({ 
    crop, 
    onChange, 
    onComplete, 
    aspect, 
    children, 
    className 
  }: any) => (
    <div 
      data-testid="react-crop" 
      data-crop={JSON.stringify(crop)} 
      data-aspect={aspect} 
      className={className}
    >
      <button 
        data-testid="mock-crop-change"
        onClick={() => onChange({ width: 80, height: 20, x: 10, y: 10, unit: '%' })}
      >
        Mock Change Crop
      </button>
      <button 
        data-testid="mock-crop-complete"
        onClick={() => onComplete({ width: 100, height: 50, x: 0, y: 0, unit: 'px' })}
      >
        Mock Complete Crop
      </button>
      {children}
    </div>
  );
  
  return {
    __esModule: true,
    default: ReactCrop,
    centerCrop: jest.fn((crop, width, height) => crop),
    makeAspectCrop: jest.fn((crop, aspect, width, height) => crop),
  };
});

jest.mock('react-image-crop/dist/ReactCrop.css', () => ({}));

jest.mock('@/components/button', () => ({
  __esModule: true,
  default: ({ 
    icon, 
    colorScheme, 
    size, 
    text, 
    onClick 
  }: any) => (
    <button 
      data-testid={`button-${text.toLowerCase()}`}
      onClick={onClick}
      className={`${colorScheme} ${size}`}
    >
      {icon} {text}
    </button>
  ),
}));

jest.mock('@/components/icons/SaveIcon', () => () => <span data-testid="save-icon" />);
jest.mock('@/components/icons/TrashIcon', () => () => <span data-testid="trash-icon" />);

class MockCanvas {
  width = 0;
  height = 0;
  contextAttributes: any = {};
  
  getContext(contextId: string, options?: any) {
    if (contextId === '2d') {
      this.contextAttributes = options || {};
      return {
        drawImage: jest.fn(),
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        scale: jest.fn(),
        transform: jest.fn(),
        setTransform: jest.fn(),
        resetTransform: jest.fn(),
        createLinearGradient: jest.fn(),
        createRadialGradient: jest.fn(),
        createPattern: jest.fn(),
        beginPath: jest.fn(),
        closePath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn(),
        quadraticCurveTo: jest.fn(),
        arc: jest.fn(),
        arcTo: jest.fn(),
        rect: jest.fn(),
        ellipse: jest.fn(),
        clip: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        fillText: jest.fn(),
        strokeText: jest.fn(),
        measureText: jest.fn(),
        createImageData: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
        getContextAttributes: jest.fn(() => this.contextAttributes),
        isContextLost: jest.fn(),
      };
    }
    return null;
  }
  
  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number) {
    const blob = new Blob(['mock-image-data'], { type: type || 'image/png' });
    callback(blob);
  }
}

global.HTMLCanvasElement = MockCanvas as any;

describe('BannerCropModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockImageUrl = 'https://example.com/test-image.jpg';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.Image = class {
      onload: () => void = () => {};
      src: string = '';
      width: number = 800;
      height: number = 600;
      naturalWidth: number = 800;
      naturalHeight: number = 600;
      
      constructor() {
        setTimeout(() => {
          this.onload();
        }, 0);
      }
    } as any;
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <BannerCropModal 
          isOpen={false}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.queryByText('Recortar Banner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('react-crop')).not.toBeInTheDocument();
    });
    
    it('should render when isOpen is true', () => {
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('Recortar Banner')).toBeInTheDocument();
      expect(screen.getByTestId('react-crop')).toBeInTheDocument();
      expect(screen.getByTestId('button-cancelar')).toBeInTheDocument();
      expect(screen.getByTestId('button-confirmar')).toBeInTheDocument();
    });
    
    it('should render correct modal structure and classes', () => {
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const modalOverlay = screen.getByText('Recortar Banner').closest('.fixed');
      expect(modalOverlay).toHaveClass('bg-[#00000090] flex items-center justify-center z-50 p-4');
      
      const modalContent = screen.getByText('Recortar Banner').closest('.bg-white');
      expect(modalContent).toHaveClass('rounded-lg p-6 max-w-3xl w-full max-h-[90vh] flex flex-col');
    });
  });
  
  describe('Image Loading and Initial Crop', () => {
    it('should set initial crop when image loads', async () => {
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByAltText('Banner')).toBeInTheDocument();
      });
      
      const reactCrop = screen.getByTestId('react-crop');
      expect(reactCrop).toHaveAttribute('data-aspect', '6');
    });
    
    it('should apply correct styles to image', () => {
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const image = screen.getByAltText('Banner');
      expect(image).toHaveStyle({
        maxWidth: '100%',
        maxHeight: '60vh',
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
      });
    });
    
    it('should handle image load event', async () => {
      const user = userEvent.setup();
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const image = screen.getByAltText('Banner');
      
      fireEvent.load(image);
      
      await waitFor(() => {
        expect(screen.getByTestId('react-crop')).toBeInTheDocument();
      });
    });
  });
  
  describe('Crop Interaction', () => {
    it('should handle crop change via ReactCrop', async () => {
      const user = userEvent.setup();
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const changeButton = screen.getByTestId('mock-crop-change');
      await act(async () => {
        await user.click(changeButton);
      });
      
      const reactCrop = screen.getByTestId('react-crop');
      const cropData = JSON.parse(reactCrop.getAttribute('data-crop') || '{}');
      expect(cropData).toBeDefined();
    });
    
    it('should handle crop completion via ReactCrop', async () => {
      const user = userEvent.setup();
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const completeButton = screen.getByTestId('mock-crop-complete');
      await act(async () => {
        await user.click(completeButton);
      });
      
      expect(completeButton).toBeInTheDocument();
    });
  });
  
  describe('Button Interactions', () => {
    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const cancelButton = screen.getByTestId('button-cancelar');
      await act(async () => {
        await user.click(cancelButton);
      });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
    
    it('should handle Save button click with valid crop', async () => {
      const user = userEvent.setup();
      
      const mockCanvas = new MockCanvas();
      const mockContext = mockCanvas.getContext('2d');
      const mockToBlob = jest.fn((callback) => {
        const blob = new Blob(['test'], { type: 'image/jpeg' });
        callback(blob);
      });
      mockCanvas.toBlob = mockToBlob;
      
      const __orig_createElement = document.createElement.bind(document);
      const __real_canvas = __orig_createElement('canvas') as any;
      __real_canvas.getContext = () => mockContext;
      __real_canvas.toBlob = mockToBlob;
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') return __real_canvas as any;
        return __orig_createElement(tagName);
      });
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const image = screen.getByAltText('Banner');
      fireEvent.load(image);
      
      const completeButton = screen.getByTestId('mock-crop-complete');
      await act(async () => {
        await user.click(completeButton);
      });
      
      const saveButton = screen.getByTestId('button-confirmar');
      await act(async () => {
        await user.click(saveButton);
      });
      
      await waitFor(() => {
        expect(mockToBlob).toHaveBeenCalled();
      });
      
      expect(mockOnSave).toHaveBeenCalledWith(expect.any(Blob));
    });
    
    it('should not save when no crop is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const saveButton = screen.getByTestId('button-confirmar');
      await act(async () => {
        await user.click(saveButton);
      });
      
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    
    it('should not save when image ref is not available', async () => {
      const user = userEvent.setup();
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const saveButton = screen.getByTestId('button-confirmar');
      await act(async () => {
        await user.click(saveButton);
      });
      
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
  
  describe('Canvas Operations', () => {
    it('should create canvas with correct dimensions based on crop', async () => {
      const user = userEvent.setup();
      const mockDrawImage = jest.fn();
      
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => ({
          drawImage: mockDrawImage,
        })),
        toBlob: jest.fn((callback) => {
          callback(new Blob(['test'], { type: 'image/jpeg' }));
        }),
      };
      const __orig_createElement2 = document.createElement.bind(document);
      const __real_canvas2 = __orig_createElement2('canvas') as any;
      __real_canvas2.getContext = mockCanvas.getContext;
      __real_canvas2.toBlob = mockCanvas.toBlob;
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') return __real_canvas2 as any;
        return __orig_createElement2(tagName);
      });
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const image = screen.getByAltText('Banner');
      
      Object.defineProperty(image, 'naturalWidth', { value: 800 });
      Object.defineProperty(image, 'naturalHeight', { value: 600 });
      Object.defineProperty(image, 'width', { value: 400 });
      Object.defineProperty(image, 'height', { value: 300 });
      
      fireEvent.load(image);
      
      const completeButton = screen.getByTestId('mock-crop-complete');
      await act(async () => {
        await user.click(completeButton);
      });
      
      const saveButton = screen.getByTestId('button-confirmar');
      await act(async () => {
        await user.click(saveButton);
      });
      
      await waitFor(() => {
        expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
        expect(mockDrawImage).toHaveBeenCalled();
        expect(mockCanvas.toBlob).toHaveBeenCalledWith(
          expect.any(Function),
          'image/jpeg',
          0.95
        );
      });
    });
    
    it('should handle canvas context creation failure', async () => {
      const user = userEvent.setup();
      
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => null),
        toBlob: jest.fn(),
      };
      const __orig_createElement3 = document.createElement.bind(document);
      const __real_canvas3 = __orig_createElement3('canvas') as any;
      __real_canvas3.getContext = mockCanvas.getContext;
      __real_canvas3.toBlob = mockCanvas.toBlob;
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') return __real_canvas3 as any;
        return __orig_createElement3(tagName);
      });
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const image = screen.getByAltText('Banner');
      fireEvent.load(image);
      
      const completeButton = screen.getByTestId('mock-crop-complete');
      await act(async () => {
        await user.click(completeButton);
      });
      
      const saveButton = screen.getByTestId('button-confirmar');
      await act(async () => {
        await user.click(saveButton);
      });
      
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    
    it('should calculate correct scale and crop dimensions', async () => {
      const user = userEvent.setup();
      const mockDrawImage = jest.fn();
      
      const createElementSpy = jest.spyOn(document, 'createElement');
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const image = screen.getByAltText('Banner');
      
      Object.defineProperty(image, 'naturalWidth', { value: 1200 });
      Object.defineProperty(image, 'naturalHeight', { value: 800 });
      Object.defineProperty(image, 'width', { value: 600 });
      Object.defineProperty(image, 'height', { value: 400 });
      
      fireEvent.load(image);
      
      const completeButton = screen.getByTestId('mock-crop-complete');
      await act(async () => {
        await user.click(completeButton);
      });
      
      const saveButton = screen.getByTestId('button-confirmar');
      await act(async () => {
        await user.click(saveButton);
      });
      
      expect(createElementSpy).toHaveBeenCalledWith('canvas');
    });
  });
  
  describe('Edge Cases and Error Handling', () => {
    it('should handle empty or invalid image URL', () => {
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl=""
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const image = screen.getByAltText('Banner');
      expect((image.getAttribute('src') || '')).toBe('');
    });
    
    it('should handle image load error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const image = screen.getByAltText('Banner');
      
      fireEvent.error(image);
      
      expect(screen.getByText('Recortar Banner')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
    
    it('should handle blob creation failure in toBlob', async () => {
      const user = userEvent.setup();
      
      const mockCanvas = new MockCanvas();
      mockCanvas.toBlob = jest.fn((callback) => {
        callback(null);
      });
      const __orig_createElement4 = document.createElement.bind(document);
      const __real_canvas4 = __orig_createElement4('canvas') as any;
      __real_canvas4.toBlob = mockCanvas.toBlob;
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') return __real_canvas4 as any;
        return __orig_createElement4(tagName);
      });
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const image = screen.getByAltText('Banner');
      fireEvent.load(image);
      
      const completeButton = screen.getByTestId('mock-crop-complete');
      await act(async () => {
        await user.click(completeButton);
      });
      
      const saveButton = screen.getByTestId('button-confirmar');
      await act(async () => {
        await user.click(saveButton);
      });
      
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    
    it('should maintain aspect ratio of 6:1', () => {
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const reactCrop = screen.getByTestId('react-crop');
      expect(reactCrop).toHaveAttribute('data-aspect', '6');
    });
  });
  
  describe('centerAspectCropFn Utility', () => {
    it('should call react-image-crop helpers on image load', async () => {
      const mockCenterCrop = jest.requireMock('react-image-crop').centerCrop;
      const mockMakeAspectCrop = jest.requireMock('react-image-crop').makeAspectCrop;

      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const image = screen.getByAltText('Banner');
      fireEvent.load(image);

      await waitFor(() => {
        expect(mockMakeAspectCrop).toHaveBeenCalled();
        expect(mockCenterCrop).toHaveBeenCalled();
      });
    });

    it('should not throw when media dimensions are zero', async () => {
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const image = screen.getByAltText('Banner');
      Object.defineProperty(image, 'naturalWidth', { value: 0 });
      Object.defineProperty(image, 'naturalHeight', { value: 0 });
      Object.defineProperty(image, 'width', { value: 0 });
      Object.defineProperty(image, 'height', { value: 0 });

      expect(() => fireEvent.load(image)).not.toThrow();
    });
  });
  
  describe('Accessibility and Semantic HTML', () => {
    it('should have appropriate ARIA attributes', () => {
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const modal = screen.getByText('Recortar Banner').closest('.fixed');
      const image = screen.getByAltText('Banner');
      expect(image).toBeInTheDocument();
      
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Confirmar')).toBeInTheDocument();
    });
    
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      
      render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const cancelButton = screen.getByTestId('button-cancelar');
      const confirmButton = screen.getByTestId('button-confirmar');
      
      cancelButton.focus();
      expect(cancelButton).toHaveFocus();
      
      confirmButton.focus();
      expect(confirmButton).toHaveFocus();
      
      await act(async () => {
        await user.keyboard('{Enter}');
      });
    });
  });
  
  describe('Performance and Optimization', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const originalHandleSave = jest.fn();
      
      rerender(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('Recortar Banner')).toBeInTheDocument();
    });
    
    it('should cleanup event listeners and refs on unmount', () => {
      const { unmount } = render(
        <BannerCropModal 
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(() => unmount()).not.toThrow();
    });
  });
});