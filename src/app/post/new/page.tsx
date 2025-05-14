'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/src/components/Modal';

export default function NewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    image: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // State for cropping
  const [widthPercent, setWidthPercent] = useState(100);
  const [heightPercent, setHeightPercent] = useState(100);
  const [offsetHorizontalPercent, setOffsetHorizontalPercent] = useState(0);
  const [offsetVerticalPercent, setOffsetVerticalPercent] = useState(0);

  // State for blurring
  const [blurValue, setBlurValue] = useState(1);


  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let response = await fetch(`/api/session`);
      let data = await response.json();
      let { session } = data;
      if (session?.userId) {
        setLoading(false);
      } else {
        router.replace('/');
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {

      if (!formData.image) {
        throw new Error('Please select an image');
      }

      if (!['png', 'jpg', 'jpeg'].includes(formData.image.type))
        throw new Error('Images must be png, jpg, or jpeg');

      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(formData.image!);
      });

      // Remove data URL prefix
      const imageData = base64Image.split(',')[1];

      // Prepare post data
      const postData = {
        title: formData.title,
        image: {
          data: imageData,
          contentType: formData.image.type,
        },
        caption: formData.caption,
      };

      // Send to API
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      router.push('/');
    } catch (err) {
      // console.error('Error creating post:', err);
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditImage = async (operation: string) => {
    setIsEditing(true);
    setError('');

    try {
      if (!formData.image) {
        throw new Error('Please select an image');
      }

      if (!['png', 'jpg', 'jpeg'].includes(formData.image.type))
        throw new Error('Images must be png, jpg, or jpeg');

      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(formData.image!);
      });

      // Remove data URL prefix
      const imageData = base64Image.split(',')[1];

      // Prepare post data
      const postData = {
        image: {
          data: imageData,
          contentType: formData.image.type,
        },
        operation,
        additionalData: {}
      };

      if (operation === 'crop') {
        postData.additionalData = { widthPercent, heightPercent, offsetHorizontalPercent, offsetVerticalPercent };
        setWidthPercent(100);
        setHeightPercent(100);
        setOffsetHorizontalPercent(0);
        setOffsetVerticalPercent(0);
      }

      if (operation === 'blur') {
        postData.additionalData = { blurValue };
        setBlurValue(1);
      }

      // Send to API
      const response = await fetch('/api/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setPreviewImage(imageUrl);
      formData.image = new File([blob], 'edited-image.png', { type: blob.type });
    } catch (e) {
      // console.error('Error creating post:', e);
      setError(
        e instanceof Error ? e.message : 'An unknown error occurred'
      );
    } finally {
      setIsEditing(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className='mb-1'>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept=".png, .jpg, .jpeg"
            required
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          {previewImage && (
            <div className="mt-2">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full h-auto max-h-60 rounded-md"
              />
            </div>
          )}
        </div>

        {previewImage && (
          <div className="flex justify-front">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              disabled={isSubmitting}
              className="px-2 py-1 bg-indigo-600 text-sm text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Image
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caption
          </label>
          <textarea
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        {/* The error box */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* The preview image */}
        {previewImage && (
          <div className="mt-1">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full h-auto max-h-80 rounded-md"
            />
          </div>
        )}

        <div className="my-1 flex flex-col">
          {/* The grayscale button */}
          <button
            type="button"
            onClick={() => { handleEditImage(`grayscale`) }}
            disabled={isEditing}
            className="mt-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Grayscale
          </button>

          {/* The crop button + inputs */}
          <div className="flex flex-col my-2 border rounded p-2">
            <div className='flex'>
              <label className='p-2' htmlFor="width-percent">Width %</label>
              <input
                id="width-percent"
                type="number"
                placeholder="100"
                value={widthPercent}
                onChange={(e) => setWidthPercent(Number(e.target.value))}
                min="0"
                max="100"
                className="w-20 mr-2 px-2 py-2 border rounded text-sm"
              />
              <p className="inline mr-2 py-2">x</p>
              <label className='p-2' htmlFor="height-percent">Height %</label>
              <input
                id="height-percent"
                type="number"
                placeholder="100"
                value={heightPercent}
                onChange={(e) => setHeightPercent(Number(e.target.value))}
                min="0"
                max="100"
                className="w-20 mr-2 px-2 py-2 border rounded text-sm"
              />
            </div>

            <div className='flex'>
              <label className='p-2' htmlFor="horizontal-offset-percent">Horizontal Offset %</label>
              <input
                id="horizontal-offset-percent"
                type="number"
                placeholder="0"
                value={offsetHorizontalPercent}
                onChange={(e) => setOffsetHorizontalPercent(Number(e.target.value))}
                min="0"
                max="100"
                className="w-20 mr-2 px-2 py-2 border rounded text-sm"
              />
              <p className="inline mr-2 py-2">x</p>
              <label className='p-2' htmlFor="vertical-offset-percent">Vertical Offset %</label>
              <input
                id="vertical-offset-percent"
                type="number"
                placeholder="0"
                value={offsetVerticalPercent}
                onChange={(e) => setOffsetVerticalPercent(Number(e.target.value))}
                min="0"
                max="100"
                className="w-20 mr-2 px-2 py-2 border rounded text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => { handleEditImage(`crop`) }}
              disabled={isEditing}
              className="mt-2 mr-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Crop
            </button>
          </div>

          {/* The blur button */}
          <div className="flex my-2 border rounded p-2">
            <label htmlFor="blur-slider" className="p-3">Blur Effect:</label>
            <input
              id="blur-slider"
              type="range"
              placeholder="1"
              value={blurValue}
              onChange={(e) => setBlurValue(Number(e.target.value))}
              min="1"
              max="10"
              className="w-20 mr-2 px-2 py-2 border rounded text-sm"
              step="1"
            />
            <span id="blur-value" className="p-3">{blurValue}</span>

            <button
              type="button"
              onClick={() => { handleEditImage(`blur`) }}
              disabled={isEditing}
              className="w-20 px-2 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Blur
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
