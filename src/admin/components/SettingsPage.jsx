import React, { useMemo, useState } from 'react'
import {
  Box,
  H2,
  Text,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  MessageBox,
} from '@adminjs/design-system'

const SettingsPage = (props) => {
  const initialSettings = useMemo(() => {
  return props?.data?.settings || []
}, [props])

  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const onChangeValue = function (id, value) {
    setSettings(function (prev) {
      return prev.map(function (item) {
        if (item.id === id) {
          return { ...item, value: value }
        }
        return item
      })
    })
  }

  const onSave = async function () {
    setIsSaving(true)
    setNotice(null)

    try {
      const response = await fetch('/admin/api/pages/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settings }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(
          payload?.message || 'Failed to save settings.'
        )
      }

      setSettings(payload.settings || settings)
      setNotice({ message: 'Settings saved successfully.', variant: 'success' })
    } catch (error) {
      setNotice({ message: error.message, variant: 'danger' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Box variant="grey" p="xxl">
      <H2>System Settings</H2>
      <Text mt="default" mb="xl">
        Update key-value configuration used by your store.
      </Text>

      {notice ? (
        <MessageBox variant={notice.variant} mb="xl">
          {notice.message}
        </MessageBox>
      ) : null}

      <Box variant="white" p="xl" borderRadius="lg" boxShadow="card">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Group</b></TableCell>
              <TableCell><b>Key</b></TableCell>
              <TableCell><b>Value</b></TableCell>
              <TableCell><b>Description</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {settings.map(function (setting) {
              return (
                <TableRow key={setting.id}>
                  <TableCell>{setting.group}</TableCell>
                  <TableCell>{setting.key}</TableCell>
                  <TableCell>
                    <Input
                      value={setting.value || ''}
                      onChange={function (event) {
                        onChangeValue(setting.id, event.target.value)
                      }}
                    />
                  </TableCell>
                  <TableCell>{setting.description || '-'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <Button mt="xl" variant="primary" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  )
}

export default SettingsPage