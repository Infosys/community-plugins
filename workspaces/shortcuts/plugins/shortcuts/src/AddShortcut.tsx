/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
} from '@backstage/ui';
import { ShortcutForm } from './ShortcutForm';
import { FormValues, Shortcut } from './types';
import { ShortcutApi } from './api';
import { alertApiRef, useApi, useAnalytics } from '@backstage/core-plugin-api';
import styles from './AddShortcut.module.css';

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  api: ShortcutApi;
  allowExternalLinks?: boolean;
};

export const AddShortcut = ({
  isOpen,
  onOpenChange,
  api,
  allowExternalLinks,
}: Props) => {
  const alertApi = useApi(alertApiRef);
  const { pathname, search } = useLocation();
  const [formValues, setFormValues] = useState<FormValues>();
  const analytics = useAnalytics();

  const handleSave: SubmitHandler<FormValues> = async ({ url, title }) => {
    analytics.captureEvent('click', `Clicked 'Save' in AddShortcut`);
    const shortcut: Omit<Shortcut, 'id'> = { url, title };

    try {
      await api.add(shortcut);
      alertApi.post({
        message: `Added shortcut '${title}' to your sidebar`,
        severity: 'success',
        display: 'transient',
      });
    } catch (error) {
      alertApi.post({
        message: `Could not add shortcut: ${error.message}`,
        severity: 'error',
      });
    }

    handleClose();
  };

  const handlePaste = () => {
    setFormValues({ url: `${pathname}${search}`, title: document.title });
  };

  const handleClose = () => {
    setFormValues(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog isOpen={isOpen} isDismissable onOpenChange={onOpenChange}>
      <DialogHeader>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Add Shortcut</span>
          <Button
            aria-label="Use current page"
            variant="secondary"
            onPress={handlePaste}
            className={styles.button}
          >
            Use current page
          </Button>
        </div>
      </DialogHeader>
      <DialogBody>
        <ShortcutForm
          onClose={handleClose}
          onSave={handleSave}
          formValues={formValues}
          allowExternalLinks={allowExternalLinks}
        />
      </DialogBody>
    </Dialog>
  );
};
