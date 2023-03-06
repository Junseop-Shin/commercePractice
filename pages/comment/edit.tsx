import AutoSizeImage from '@components/AutoSizeImage';
import CustomEditor from '@components/Editor';
import { Slider } from '@mantine/core';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export default function CommentEdit() {
  const router = useRouter();
  const { orderItemId } = router.query;
  const [rate, setRate] = useState(5);
  const [editorState, setEditorState] = useState<EditorState | undefined>(
    undefined
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (orderItemId == null) {
      return;
    }

    fetch(`/api/get-comment?orderItemId=${orderItemId}`).then((res) =>
      res.json().then((data) => {
        if (data.items?.contents != null) {
          setEditorState(
            EditorState.createWithContent(
              convertFromRaw(JSON.parse(data.items.contents))
            )
          );
          setRate(data.items.rate);
          setImages(data.items.images.split(',') ?? []);
        } else {
          setEditorState(EditorState.createEmpty());
        }
      })
    );
  }, [orderItemId]);

  const handleSave = () => {
    if (editorState && orderItemId != null) {
      fetch('/api/update-comment', {
        method: 'POST',
        body: JSON.stringify({
          orderItemId: Number(orderItemId),
          rate: rate,
          contents: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          image: images.join(','),
        }),
      }).then((res) =>
        res.json().then((data) => {
          alert('success');
          router.back();
        })
      );
    }
  };

  const handleChange = () => {
    if (inputRef.current && inputRef.current.files) {
      for (let i = 0; i < inputRef.current.files.length; i++) {
        const fd = new FormData();

        fd.append(
          'image',
          inputRef.current.files[i],
          inputRef.current.files[i].name
        );

        // 이미지 업로드 제공 서비스 url
        fetch('', {
          method: 'POST',
          body: fd,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            setImages((prev) =>
              Array.from(new Set(prev.concat(data.data.image.url)))
            );
          })
          .catch((error) => console.log(error));
      }
    }
  };
  return (
    <div>
      {editorState != null && (
        <CustomEditor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          onSave={handleSave}
        />
      )}
      <Slider
        defaultValue={5}
        min={1}
        max={5}
        step={1}
        value={rate}
        onChange={setRate}
        marks={[
          { value: 1 },
          { value: 2 },
          { value: 3 },
          { value: 4 },
          { value: 5 },
        ]}
      />
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
        />
        {images &&
          images.length > 0 &&
          images.map((image, idx) => <AutoSizeImage key={idx} src={image} />)}
      </div>
    </div>
  );
}
